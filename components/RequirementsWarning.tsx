'use client';

export default function RequirementsWarning() {
  return (
    <div className="warning">
      <strong>⚠️ Requirements:</strong>
      <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
        <li>
          MetaMask Flask 13.5.0 or later installed{' '}
          <a 
            href="https://docs.metamask.io/snaps/get-started/install-flask/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#0066cc', textDecoration: 'underline' }}
          >
            (Download Flask)
          </a>
        </li>
        <li><strong style={{ display: 'inline' }}>Disable regular MetaMask</strong> - Only keep Flask enabled in your browser</li>
        <li>Connected to Sepolia network</li>
        <li>User account will be automatically upgraded to Smart Account</li>
      </ul>
    </div>
  );
}

