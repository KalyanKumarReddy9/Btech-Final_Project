import { attachWalletUI, attachSwitchAccountUI, connectWallet } from './wallet.js';
import { showResults, endVoting } from './admin.js';

// This module contains page-specific initialization that used to be inline in admin.html.
// Moving it here avoids inline scripts which helps strict CSP setups (and avoids eval).

// --- JWT Authorization Check ---
const token = localStorage.getItem('jwtTokenAdmin');
if (!token) {
  alert('Please login first');
  window.location.href = 'login.html';
}

// Wire wallet UI
attachWalletUI({ buttonId: 'connectWalletBtn', displayId: 'connectedAddress' });
attachSwitchAccountUI({ buttonId: 'switchAccountBtn', displayId: 'connectedAddress' });

// Add Candidate
async function addCandidate(name, party) {
  try {
    const response = await fetch('http://127.0.0.1:8000/add-candidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, party })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to add candidate');
    alert('Candidate added successfully!');
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Define Voting Dates
async function defineDates(startDate, endDate) {
  try {
    const response = await fetch('http://127.0.0.1:8000/set-dates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ startDate, endDate })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || 'Failed to set dates');
    alert('Voting dates defined successfully!');
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
}

// Attach DOM handlers
document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('addCandidateBtn');
  if (addBtn) {
    addBtn.addEventListener('click', async () => {
      try { await connectWallet(); } catch (e) {}
      const name = document.getElementById('name').value;
      const party = document.getElementById('party').value;
      addCandidate(name, party);
    });
  }

  const setBtn = document.getElementById('setDatesBtn');
  if (setBtn) {
    setBtn.addEventListener('click', async () => {
      try { await connectWallet(); } catch (e) {}
      const startDate = document.getElementById('startDate').value;
      const endDate = document.getElementById('endDate').value;
      defineDates(startDate, endDate);
    });
  }

  const showBtn = document.getElementById('showResultsBtn');
  if (showBtn) showBtn.addEventListener('click', showResults);

  const endBtn = document.getElementById('endVotingBtn');
  if (endBtn) endBtn.addEventListener('click', () => {
    if (!confirm('Are you sure you want to end voting? This will make voting inactive immediately.')) return;
    endVoting();
  });
});
