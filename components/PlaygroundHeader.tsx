'use client';

import WalletConnection from './WalletConnection';

interface PlaygroundHeaderProps {
  onDisconnect?: () => void;
}

export default function PlaygroundHeader({ onDisconnect }: PlaygroundHeaderProps) {
  return (
    <header className="playground-header">
      <div className="playground-header-left">
        <h1 className="playground-title">🔧 ERC-7715 Dev Playground</h1>
        <p className="playground-subtitle">MetaMask Advanced Permissions Testing</p>
      </div>
      <div className="playground-header-right">
        <WalletConnection onDisconnect={onDisconnect} />
      </div>
    </header>
  );
}

