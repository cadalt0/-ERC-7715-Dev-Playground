'use client';

import { useState } from 'react';
import { requestCustomPermission } from '@/lib/metamask-permissions/request-custom';
import { PermissionConfig } from '@/lib/metamask-permissions/types';
import PermissionRequestForm from './permission-request/PermissionRequestForm';

interface PermissionRequestProps {
  sessionAccountAddress: string;
  walletClient: any;
  connectedAddress: string | undefined;
  onPermissionGranted: (permissionsContext: string, delegationManager: string, config: PermissionConfig, userAccountAddress: string, userAccountIsUpgraded: boolean) => void;
  onStatusChange: (status: { type: 'info' | 'success' | 'error'; message: string }) => void;
  onOutputChange: (output: string) => void;
}

export default function PermissionRequest({
  sessionAccountAddress,
  walletClient,
  connectedAddress,
  onPermissionGranted,
  onStatusChange,
  onOutputChange,
}: PermissionRequestProps) {
  const [loading, setLoading] = useState(false);

  const handleFormSubmit = async (config: PermissionConfig) => {
    if (!connectedAddress) {
      onStatusChange({ type: 'error', message: 'Please connect your wallet first' });
      return;
    }

    if (!sessionAccountAddress) {
      onStatusChange({ type: 'error', message: 'Session account address not loaded. Please refresh the page.' });
      return;
    }

    setLoading(true);
    onOutputChange('');
    onStatusChange({ type: 'info', message: 'Requesting permission... Please check MetaMask Flask.' });

    try {
      const result = await requestCustomPermission(
        config,
        sessionAccountAddress,
        walletClient,
        connectedAddress || undefined
      );
      
      const permissionsContext = result.permission?.permissionsContext || null;
      const delegationManager = result.permission?.delegationManager || null;
      const userAccountAddress = result.userAccount?.address || null;
      const userAccountIsUpgraded = result.userAccount?.isUpgraded || false;
      
      if (permissionsContext && delegationManager) {
        onPermissionGranted(permissionsContext, delegationManager, config, userAccountAddress || '', userAccountIsUpgraded);
      }
      
      // Don't show JSON output - details are in the popup
      onOutputChange('');
      onStatusChange({ 
        type: 'success', 
        message: 'Permission requested successfully!'
      });
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      onOutputChange(`Error: ${errorMessage}`);
      onStatusChange({ type: 'error', message: errorMessage });
      console.error('Permission request failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PermissionRequestForm
      onSubmit={handleFormSubmit}
      disabled={loading || !sessionAccountAddress || !connectedAddress || !walletClient}
    />
  );
}

