// Minimal MetaMask + Ganache connector
// Requirements:
// - Detect MetaMask
// - Connect on button click
// - Show connected address
// - Ensure Ganache network (default 127.0.0.1:7545)

// Support common Ganache chain IDs: 1337 (0x539) and 5777 (0x1691)
export const ALLOWED_GANACHE_CHAIN_IDS = ['0x539', '0x1691'];

export function isMetaMaskInstalled() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && window.ethereum.isMetaMask;
}

export async function ensureGanacheNetwork() {
  const provider = window.ethereum;
  if (!provider) throw new Error('MetaMask not detected');
  const chainId = await provider.request({ method: 'eth_chainId' });
  if (!ALLOWED_GANACHE_CHAIN_IDS.includes(chainId)) {
    // Try to switch; if not added, try to add
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ALLOWED_GANACHE_CHAIN_IDS[0] }]
      });
    } catch (switchError) {
      // If chain is not added
      if (switchError.code === 4902) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: ALLOWED_GANACHE_CHAIN_IDS[0],
              chainName: 'Ganache Local',
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['http://127.0.0.1:7545'],
              blockExplorerUrls: []
            }]
          });
        } catch (addError) {
          throw new Error('Please switch to Ganache network in MetaMask');
        }
      } else {
        throw new Error('Please switch to Ganache network in MetaMask');
      }
    }
  }
}

export async function connectWallet() {
  if (!isMetaMaskInstalled()) throw new Error('MetaMask is not installed');
  await ensureGanacheNetwork();
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  if (!accounts || accounts.length === 0) throw new Error('No accounts returned');
  const selected = accounts[0];
  return selected;
}

export function formatAddress(addr) {
  if (!addr) return '';
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

export function attachWalletUI({ buttonId, displayId, onConnected }) {
  const btn = document.getElementById(buttonId);
  const display = document.getElementById(displayId);
  if (!btn) return;
  if (!isMetaMaskInstalled()) {
    btn.textContent = 'Install MetaMask';
    btn.onclick = () => window.open('https://metamask.io/download', '_blank');
    return;
  }
  btn.addEventListener('click', async () => {
    try {
      btn.disabled = true;
      btn.textContent = 'Connecting...';
      const addr = await connectWallet();
      if (display) display.textContent = addr;
      btn.textContent = 'Connected';
      btn.disabled = true;
      if (onConnected) onConnected(addr);
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to connect');
      btn.textContent = 'Connect Wallet';
      btn.disabled = false;
    }
  });

  // Update display on account changes
  if (window.ethereum) {
    window.ethereum.on?.('accountsChanged', (accounts) => {
      const addr = (accounts && accounts[0]) || '';
      if (display) display.textContent = addr;
      if (addr) {
        btn.textContent = 'Connected';
        btn.disabled = true;
      } else {
        btn.textContent = 'Connect Wallet';
        btn.disabled = false;
      }
    });
  }
}

// Force MetaMask to re-prompt account permissions (to switch accounts)
export async function requestAccountPermissions() {
  if (!isMetaMaskInstalled()) throw new Error('MetaMask is not installed');
  await ensureGanacheNetwork();
  await window.ethereum.request({
    method: 'wallet_requestPermissions',
    params: [{ eth_accounts: {} }]
  });
  const accounts = await window.ethereum.request({ method: 'eth_accounts' });
  return accounts && accounts[0];
}

export function attachSwitchAccountUI({ buttonId, displayId }) {
  const btn = document.getElementById(buttonId);
  const display = displayId ? document.getElementById(displayId) : null;
  if (!btn) return;
  if (!isMetaMaskInstalled()) {
    btn.textContent = 'Install MetaMask';
    btn.onclick = () => window.open('https://metamask.io/download', '_blank');
    return;
  }
  btn.addEventListener('click', async () => {
    try {
      btn.disabled = true;
      btn.textContent = 'Switching...';
      const addr = await requestAccountPermissions();
      if (display) display.textContent = addr || '';
      btn.textContent = 'Switch Account';
      btn.disabled = false;
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to switch account');
      btn.textContent = 'Switch Account';
      btn.disabled = false;
    }
  });
}


