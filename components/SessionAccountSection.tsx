'use client';

import PermissionRequest from './PermissionRequest';

interface SessionAccountSectionProps {
  sessionAccountAddress: string | null;
  sessionAccountLoading: boolean;
  sessionAccountError: string | null;
  walletClient: any;
  connectedAddress: string | undefined;
  onPermissionGranted: (permissionsContext: string, delegationManager: string, config: any, userAccountAddress: string, userAccountIsUpgraded: boolean) => void;
  onStatusChange: (status: { type: 'info' | 'success' | 'error'; message: string }) => void;
  onOutputChange: (output: string) => void;
}

export default function SessionAccountSection({
  sessionAccountAddress,
  sessionAccountLoading,
  sessionAccountError,
  walletClient,
  connectedAddress,
  onPermissionGranted,
  onStatusChange,
  onOutputChange,
}: SessionAccountSectionProps) {
  if (sessionAccountLoading || sessionAccountError || !sessionAccountAddress) {
    return null;
  }

  return (
    <PermissionRequest
      sessionAccountAddress={sessionAccountAddress}
      walletClient={walletClient}
      connectedAddress={connectedAddress}
      onPermissionGranted={onPermissionGranted}
      onStatusChange={onStatusChange}
      onOutputChange={onOutputChange}
    />
  );
}

