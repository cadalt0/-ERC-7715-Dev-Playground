import type { Metadata } from 'next';
import './globals.css';
import Web3AuthProviders from '@/components/Web3AuthProviders';

export const metadata: Metadata = {
  title: 'MetaMask Advanced Permissions - USDC Request',
  description: 'Request ERC-7715 Advanced Permissions for USDC transfers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Web3AuthProviders>
          {children}
        </Web3AuthProviders>
      </body>
    </html>
  );
}



