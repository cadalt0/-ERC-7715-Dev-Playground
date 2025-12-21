'use client';

import { SessionAccountInfo } from '@/hooks/useSessionAccount';
import { PermissionConfig } from '@/lib/metamask-permissions/types';
import PermissionRedeem from './PermissionRedeem';

interface PermissionRedeemSectionProps {
  permissionsContext: string | null;
  delegationManager: string | null;
  sessionAccountInfo: SessionAccountInfo | null;
  permissionConfig: PermissionConfig | null;
  onStatusChange: (status: { type: 'info' | 'success' | 'error'; message: string }) => void;
  onOutputChange: (output: string) => void;
}

export default function PermissionRedeemSection({
  permissionsContext,
  delegationManager,
  sessionAccountInfo,
  permissionConfig,
  onStatusChange,
  onOutputChange,
}: PermissionRedeemSectionProps) {
  if (!permissionsContext || !delegationManager || !permissionConfig) {
    return null;
  }

  return (
    <PermissionRedeem
      permissionsContext={permissionsContext}
      delegationManager={delegationManager}
      permissionConfig={permissionConfig}
      sessionAccountInfo={sessionAccountInfo}
      onStatusChange={onStatusChange}
      onOutputChange={onOutputChange}
    />
  );
}

