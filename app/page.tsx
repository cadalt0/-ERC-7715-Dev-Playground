'use client';

import { useState } from 'react';
import { useWeb3Auth } from '@web3auth/modal/react';
import { useAccount } from 'wagmi';
import { useSessionAccount } from '@/hooks/useSessionAccount';
import { useWalletClient } from '@/hooks/useWalletClient';
import { useChainSwitch } from '@/hooks/useChainSwitch';
import PlaygroundHeader from '@/components/PlaygroundHeader';
import RequirementsWarning from '@/components/RequirementsWarning';
import SessionAccountSection from '@/components/SessionAccountSection';
import SessionAccountSidebar from '@/components/SessionAccountSidebar';
import PermissionRedeemSection from '@/components/PermissionRedeemSection';
import PermissionDetailsBox from '@/components/PermissionDetailsBox';
import StatusDisplay from '@/components/StatusDisplay';
import WalletClientStatus from '@/components/WalletClientStatus';
import { PermissionConfig } from '@/lib/metamask-permissions/types';

export default function Home() {
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState<{ type: 'info' | 'success' | 'error'; message: string } | null>(null);
  const [permissionsContext, setPermissionsContext] = useState<string | null>(null);
  const [delegationManager, setDelegationManager] = useState<string | null>(null);
  const [permissionConfig, setPermissionConfig] = useState<PermissionConfig | null>(null);
  const [userAccountAddress, setUserAccountAddress] = useState<string | null>(null);
  const [userAccountIsUpgraded, setUserAccountIsUpgraded] = useState<boolean | null>(null);

  // Web3Auth hooks
  const { provider } = useWeb3Auth();
  const { address: connectedAddress } = useAccount();
  
  // Custom hooks
  const { sessionAccountAddress, sessionAccountInfo, isLoading: sessionAccountLoading, error: sessionAccountError } = useSessionAccount();
  const { walletClient, isSettingUp } = useWalletClient(
    !!connectedAddress,
    connectedAddress,
    provider
  );
  useChainSwitch(!!connectedAddress);

  const handleDisconnect = () => {
    setPermissionsContext(null);
    setDelegationManager(null);
    setPermissionConfig(null);
    setUserAccountAddress(null);
    setUserAccountIsUpgraded(null);
    setStatus({ type: 'info', message: 'Disconnected successfully' });
  };

  const handlePermissionGranted = (permissionsContext: string, delegationManager: string, config: PermissionConfig, userAccountAddress: string, userAccountIsUpgraded: boolean) => {
    setPermissionsContext(permissionsContext);
    setDelegationManager(delegationManager);
    setPermissionConfig(config);
    setUserAccountAddress(userAccountAddress);
    setUserAccountIsUpgraded(userAccountIsUpgraded);
  };

  return (
    <div className="dev-playground">
      <PlaygroundHeader onDisconnect={handleDisconnect} />

      <div className="container-wrapper">
        <div className="container-main">
          <RequirementsWarning />

          {!permissionsContext && (
            <div className="permission-request-container">
              <SessionAccountSection
                sessionAccountAddress={sessionAccountAddress}
                sessionAccountLoading={sessionAccountLoading}
                sessionAccountError={sessionAccountError}
                walletClient={walletClient}
                connectedAddress={connectedAddress}
                onPermissionGranted={handlePermissionGranted}
                onStatusChange={setStatus}
                onOutputChange={setOutput}
              />
            </div>
          )}

          <WalletClientStatus
            isConnected={!!connectedAddress}
            connectedAddress={connectedAddress}
            walletClient={walletClient}
            isSettingUp={isSettingUp}
          />

          {permissionsContext && (
            <div className="permission-redeem-container">
              <PermissionRedeemSection
                permissionsContext={permissionsContext}
                delegationManager={delegationManager}
                sessionAccountInfo={sessionAccountInfo}
                permissionConfig={permissionConfig}
                onStatusChange={setStatus}
                onOutputChange={setOutput}
              />
            </div>
          )}

          <StatusDisplay status={status} output={output} />
        </div>

        <SessionAccountSidebar
          sessionAccountAddress={sessionAccountAddress}
          sessionAccountInfo={sessionAccountInfo}
          sessionAccountLoading={sessionAccountLoading}
          sessionAccountError={sessionAccountError}
          permissionsContext={permissionsContext}
          delegationManager={delegationManager}
          permissionConfig={permissionConfig}
          userAccountAddress={userAccountAddress}
          userAccountIsUpgraded={userAccountIsUpgraded}
        />
      </div>
    </div>
  );
}

