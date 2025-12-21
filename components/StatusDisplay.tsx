'use client';

interface StatusDisplayProps {
  status: { type: 'info' | 'success' | 'error'; message: string } | null;
  output: string;
}

export default function StatusDisplay({ status, output }: StatusDisplayProps) {
  // Check if message contains a transaction hash
  const renderMessage = () => {
    if (!status) return null;
    
    const hashMatch = status.message.match(/Hash: (0x[a-fA-F0-9]{64})/);
    if (hashMatch) {
      const hash = hashMatch[1];
      const beforeHash = status.message.substring(0, hashMatch.index! + 6); // Include "Hash: "
      
      return (
        <>
          {beforeHash}
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'inherit',
              textDecoration: 'underline',
              cursor: 'pointer',
              wordBreak: 'break-all'
            }}
          >
            {hash}
          </a>
        </>
      );
    }
    
    return status.message;
  };

  return (
    <>
      {status && (
        <div className={`status ${status.type}`}>
          {renderMessage()}
        </div>
      )}

      {/* Only show output for errors - success details are in the popup */}
      {output && status?.type === 'error' && (
        <div className={`output error`}>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{output}</pre>
        </div>
      )}
    </>
  );
}

