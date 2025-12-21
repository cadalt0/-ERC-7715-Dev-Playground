'use client';

interface WalletClientStatusProps {
  isConnected: boolean;
  connectedAddress: string | undefined;
  walletClient: any;
  isSettingUp: boolean;
}

export default function WalletClientStatus({ 
  isConnected, 
  connectedAddress, 
  walletClient, 
  isSettingUp 
}: WalletClientStatusProps) {
  if (!isConnected || !connectedAddress) {
    return null;
  }

  if (isSettingUp) {
    return (
      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#666' }}>
        ⏳ Setting up wallet client for ERC-7715 permissions...
      </div>
    );
  }

  if (walletClient) {
    return (
      <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#28a745' }}>
        ✓ Wallet client ready
      </div>
    );
  }

  return null;
}

