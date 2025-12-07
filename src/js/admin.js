import { attachWalletUI, attachSwitchAccountUI } from './wallet.js';

// Admin page interactions: show results and end voting
// Read token dynamically so admin can login without reloading the module
function getHeaders(contentType) {
  const token = localStorage.getItem('jwtTokenAdmin');
  const h = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (contentType) h['Content-Type'] = contentType;
  return h;
}

// helper to render results
function renderResults(list) {
  const container = document.getElementById('resultsList');
  container.innerHTML = '';
  if (!list || list.length === 0) {
    container.innerHTML = '<div class="results-empty">No candidates found</div>';
    return;
  }
  // sort by votes desc
  list.sort((a, b) => b.vote_count - a.vote_count);
  
  // Find highest vote count (winner)
  const highestVotes = list[0].vote_count;
  const winners = list.filter(c => c.vote_count === highestVotes);
  
  // Show winner announcement card
  if (highestVotes > 0) {
    const winnerCard = document.createElement('div');
    winnerCard.className = 'winner-announcement';
    if (winners.length === 1) {
      winnerCard.innerHTML = `
        <div class="winner-icon">🏆</div>
        <h3>Winner Announcement</h3>
        <p class="winner-name">${escapeHtml(winners[0].name)}</p>
        <p class="winner-party">${escapeHtml(winners[0].party)}</p>
        <p class="winner-votes">${highestVotes} Votes</p>
      `;
    } else {
      winnerCard.innerHTML = `
        <div class="winner-icon">🏆</div>
        <h3>Tie - Multiple Winners!</h3>
        <p class="winner-votes">${highestVotes} Votes Each</p>
      `;
    }
    container.appendChild(winnerCard);
  }
  
  // Show all results
  list.forEach((c, index) => {
    const item = document.createElement('div');
    item.className = 'result-card';
    if (c.vote_count === highestVotes && highestVotes > 0) {
      item.classList.add('winner');
    }
    item.innerHTML = `
      <div class="result-info">
        <div class="info-row">
          <span class="info-label">Candidate Name:</span>
          <span class="info-value">${escapeHtml(c.name)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Candidate Party:</span>
          <span class="info-value">${escapeHtml(c.party)}</span>
        </div>
      </div>
      <div class="result-votes">
        <div class="votes-number">${c.vote_count}</div>
        <div class="votes-label">Votes</div>
      </div>
    `;
    container.appendChild(item);
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function showResults() {
  try {
    // Try authenticated endpoint first if admin token exists
    let res, data;
    const token = localStorage.getItem('jwtTokenAdmin');
    if (token) {
      res = await fetch('http://127.0.0.1:8000/candidates', { headers: getHeaders() });
      if (res.ok) {
        data = await res.json();
        renderResults(data.candidates || []);
        // Scroll to results
        document.getElementById('resultsList').scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      // if auth failed, fallthrough to public endpoint
    }

    // Fallback to public endpoint (no auth required)
    res = await fetch('http://127.0.0.1:8000/public/candidates');
    if (!res.ok) throw new Error('Failed to fetch public candidates');
    data = await res.json();
    renderResults(data.candidates || []);
    // Scroll to results
    document.getElementById('resultsList').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    console.error(e);
    alert('Error fetching results: ' + e.message);
  }
}

function showEndVotingCard() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.className = 'success-overlay';
  overlay.innerHTML = `
    <div class="success-card">
      <div class="success-icon">✓</div>
      <h2>Thank You!</h2>
      <p>The voting has been ended successfully.</p>
      <p class="success-subtext">Voting is now inactive. No more votes can be cast.</p>
      <button class="close-success-btn" onclick="this.closest('.success-overlay').remove()">Close</button>
    </div>
  `;
  document.body.appendChild(overlay);
  
  // Auto-remove after 5 seconds
  setTimeout(() => {
    if (overlay.parentNode) overlay.remove();
  }, 5000);
}

async function endVoting() {
  try {
    // set endDate to yesterday to immediately stop voting
    const now = new Date();
    const yesterday = new Date(now.getTime() - (24*60*60*1000));
    // Format as ISO string
    const startISO = new Date(0).toISOString();
    const endISO = yesterday.toISOString();
    const res = await fetch('http://127.0.0.1:8000/set-dates', {
      method: 'POST',
      headers: getHeaders('application/json'),
      body: JSON.stringify({ startDate: startISO, endDate: endISO })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'Failed to end voting');
    showEndVotingCard();
  } catch (e) {
    console.error(e);
    alert('Error ending voting: ' + e.message);
  }
}
// Exported for external initialization module (avoids inline scripts)
export { showResults, endVoting };