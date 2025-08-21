# main.py
import os
import dotenv
from fastapi import FastAPI, HTTPException, status, Request, Depends, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from mysql.connector import connect, Error
import jwt
from jwt import PyJWTError
from datetime import datetime, timedelta

# Load environment variables
dotenv.load_dotenv()

# Initialize FastAPI
app = FastAPI()

# CORS setup
origins = ["http://localhost:8080", "http://127.0.0.1:8080"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
try:
    cnx = connect(
        user=os.environ['MYSQL_USER'],
        password=os.environ['MYSQL_PASSWORD'],
        host=os.environ['MYSQL_HOST'],
        database=os.environ['MYSQL_DB']
    )
    cursor = cnx.cursor(dictionary=True)
except Error as err:
    print("Database connection error:", err)
    raise


# Ensure required tables exist
def initialize_database():
    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS candidates (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                party VARCHAR(255) NOT NULL,
                vote_count INT NOT NULL DEFAULT 0
            )
            """
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS voting_dates (
                id TINYINT PRIMARY KEY,
                start_date DATE NOT NULL,
                end_date DATE NOT NULL
            )
            """
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS votes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                voter_id VARCHAR(255) NOT NULL,
                candidate_id INT NOT NULL,
                voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_voter (voter_id),
                FOREIGN KEY (candidate_id) REFERENCES candidates(id)
            )
            """
        )
        cnx.commit()
    except Error as err:
        print("DB init error:", err)
        raise


initialize_database()

# Secret key for JWT
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # token valid for 1 hour


# Utility to create JWT token
def create_jwt_token(voter_id: str, role: str):
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "voter_id": voter_id,
        "role": role,
        "exp": expire
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token


# Utility to verify JWT token
def verify_jwt_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        voter_id: str = payload.get("voter_id")
        role: str = payload.get("role")
        if voter_id is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return payload
    except PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authorization token")


# Dependency to use in protected routes
async def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing")
    token = auth_header.replace("Bearer ", "")
    return verify_jwt_token(token)


class AddCandidatePayload(BaseModel):
    name: str
    party: str


class SetDatesPayload(BaseModel):
    startDate: str
    endDate: str


class VotePayload(BaseModel):
    candidateId: int


# Login endpoint
@app.post("/login")
async def login(voter_id: str = Form(...), password: str = Form(...), role: str | None = Form(None)):
    try:
        cursor.execute(
            "SELECT role FROM voters WHERE voter_id=%s AND password=%s",
            (voter_id, password)
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=401, detail="Invalid voter ID or password")

        db_role = user["role"]
        # Ignore client-provided role for security and rely on DB role only

        token = create_jwt_token(voter_id, db_role)
        return {"success": True, "token": token, "role": db_role}
    except Error as err:
        print("DB error:", err)
        raise HTTPException(status_code=500, detail="Database error")


# Example protected route
@app.get("/profile")
async def profile(user: dict = Depends(get_current_user)):
    # user contains decoded token data
    return {"message": f"Hello {user['voter_id']}, your role is {user['role']}"}


# Admin-only: add candidate
@app.post("/add-candidate")
async def add_candidate(payload: AddCandidatePayload, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    try:
        cursor.execute(
            "INSERT INTO candidates (name, party) VALUES (%s, %s)",
            (payload.name, payload.party)
        )
        cnx.commit()
        new_id = cursor.lastrowid
        return {"success": True, "message": "Candidate added", "id": new_id}
    except Error as err:
        print("DB error:", err)
        raise HTTPException(status_code=500, detail="Database error")


# Admin-only: set voting dates
@app.post("/set-dates")
async def set_dates(payload: SetDatesPayload, user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")
    try:
        # We keep a single row with id = 1
        cursor.execute(
            """
            INSERT INTO voting_dates (id, start_date, end_date)
            VALUES (1, %s, %s)
            ON DUPLICATE KEY UPDATE
                start_date = VALUES(start_date),
                end_date = VALUES(end_date)
            """,
            (payload.startDate, payload.endDate)
        )
        cnx.commit()
        return {"success": True, "message": "Voting dates set", "data": payload.dict()}
    except Error as err:
        print("DB error:", err)
        raise HTTPException(status_code=500, detail="Database error")


# Public (auth required) endpoints to read data for voter UI
@app.get("/candidates")
async def list_candidates(user: dict = Depends(get_current_user)):
    try:
        cursor.execute("SELECT id, name, party, vote_count FROM candidates ORDER BY id ASC")
        rows = cursor.fetchall()
        return {"success": True, "candidates": rows}
    except Error as err:
        print("DB error:", err)
        raise HTTPException(status_code=500, detail="Database error")


@app.get("/dates")
async def get_dates(user: dict = Depends(get_current_user)):
    try:
        cursor.execute("SELECT start_date, end_date FROM voting_dates WHERE id = 1")
        row = cursor.fetchone()
        if not row:
            return {"success": True, "startDate": None, "endDate": None}
        return {"success": True, "startDate": str(row["start_date"]), "endDate": str(row["end_date"])}
    except Error as err:
        print("DB error:", err)
        raise HTTPException(status_code=500, detail="Database error")


@app.get("/has-voted")
async def has_voted(user: dict = Depends(get_current_user)):
    try:
        cursor.execute("SELECT 1 FROM votes WHERE voter_id=%s", (user["voter_id"],))
        row = cursor.fetchone()
        return {"success": True, "hasVoted": bool(row)}
    except Error as err:
        print("DB error:", err)
        raise HTTPException(status_code=500, detail="Database error")


@app.post("/vote")
async def vote(payload: VotePayload, user: dict = Depends(get_current_user)):
    # Only voters can vote (accept both 'voter' and 'user' as voter roles)
    role = (user.get("role") or "").lower()
    if role not in ("voter", "user"):
        raise HTTPException(status_code=403, detail="Only voters can vote")
    try:
        # Check dates
        cursor.execute("SELECT start_date, end_date FROM voting_dates WHERE id = 1")
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Voting dates not set")

        today = datetime.utcnow().date()
        start_date = row["start_date"].date() if isinstance(row["start_date"], datetime) else row["start_date"]
        end_date = row["end_date"].date() if isinstance(row["end_date"], datetime) else row["end_date"]

        if not (start_date <= today <= end_date):
            raise HTTPException(status_code=400, detail="Voting is not active")

        # Check candidate exists
        cursor.execute("SELECT id FROM candidates WHERE id=%s", (payload.candidateId,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Candidate not found")

        # Check if user already voted
        cursor.execute("SELECT 1 FROM votes WHERE voter_id=%s", (user["voter_id"],))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="You have already voted")

        # Record vote and increment count atomically
        cursor.execute(
            "INSERT INTO votes (voter_id, candidate_id) VALUES (%s, %s)",
            (user["voter_id"], payload.candidateId)
        )
        cursor.execute(
            "UPDATE candidates SET vote_count = vote_count + 1 WHERE id=%s",
            (payload.candidateId,)
        )
        cnx.commit()
        return {"success": True, "message": "Vote recorded"}
    except Error as err:
        cnx.rollback()
        print("DB error:", err)
        raise HTTPException(status_code=500, detail="Database error")


# Run the app using: uvicorn main:app --reload
