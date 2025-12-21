'use client';

import { SessionAccountInfo } from '@/hooks/useSessionAccount';
import { PermissionConfig } from '@/lib/metamask-permissions/types';
import PermissionDetailsBox from './PermissionDetailsBox';

interface SessionAccountSidebarProps {
  sessionAccountAddress: string | null;
  sessionAccountInfo: SessionAccountInfo | null;
  sessionAccountLoading: boolean;
  sessionAccountError: string | null;
  permissionsContext: string | null;
  delegationManager: string | null;
  permissionConfig: PermissionConfig | null;
  userAccountAddress: string | null;
  userAccountIsUpgraded: boolean | null;
}

interface SessionAccountInfoExtended extends SessionAccountInfo {
  rpcError?: boolean;
  error?: string;
}

export default function SessionAccountSidebar({
  sessionAccountAddress,
  sessionAccountInfo,
  sessionAccountLoading,
  sessionAccountError,
  permissionsContext,
  delegationManager,
  permissionConfig,
  userAccountAddress,
  userAccountIsUpgraded,
}: SessionAccountSidebarProps) {
  if (sessionAccountLoading) {
    return (
      <div className="session-account-sidebar">
        <div className="session-account-box">
          <h3 className="session-account-sidebar-title">Session Account</h3>
          <div className="session-account-loading">
            ⏳ Loading session account from backend...
          </div>
        </div>
      </div>
    );
  }

  if (sessionAccountError) {
    return (
      <div className="session-account-sidebar">
        <div className="session-account-box">
          <h3 className="session-account-sidebar-title">Session Account</h3>
          <div className="session-account-error">
            ⚠️ {sessionAccountError}
          </div>
        </div>
      </div>
    );
  }

  if (!sessionAccountAddress || !sessionAccountInfo) {
    return null;
  }

  const info = sessionAccountInfo as SessionAccountInfoExtended;

  return (
    <div className="session-account-sidebar">
      <div className="session-account-box">
        <h3 className="session-account-sidebar-title">Session Account</h3>
        
        <div className="session-account-details">
          <div className="session-account-field">
            <label>Address:</label>
            <div className="session-account-value address">
              {sessionAccountInfo.address}
            </div>
          </div>

          <div className="session-account-field">
            <label>Balance:</label>
            <div className={`session-account-value balance ${sessionAccountInfo.isLowBalance ? 'low' : 'normal'}`}>
              {sessionAccountInfo.balanceEth} ETH
            </div>
          </div>

          <div className="session-account-field">
            <label>Estimated Gas:</label>
            <div className="session-account-value gas">
              ~{sessionAccountInfo.estimatedGasCostEth} ETH
            </div>
          </div>
        </div>

        {info.rpcError && (
          <div className="session-account-warning rpc-error">
            <strong>⚠️ RPC Error:</strong> {info.error || 'Could not fetch balance'}
            <div className="session-account-warning-link">
              Check balance on{' '}
              <a 
                href={`https://sepolia.etherscan.io/address/${info.address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Etherscan
              </a>
            </div>
          </div>
        )}

        {!info.rpcError && sessionAccountInfo.isLowBalance && sessionAccountInfo.warning && (
          <div className="session-account-warning low-balance">
            <strong>⚠️ Low Balance Warning:</strong>
            <div className="session-account-warning-text">
              {sessionAccountInfo.warning}
            </div>
            <div className="session-account-warning-text">
              Redeem transaction might fail due to insufficient ETH for gas fees.
              Please send ETH to the session account address above.
            </div>
          </div>
        )}
      </div>

      <PermissionDetailsBox
        sessionAccountAddress={sessionAccountAddress}
        userAccountAddress={userAccountAddress}
        userAccountIsUpgraded={userAccountIsUpgraded}
        permissionsContext={permissionsContext}
        delegationManager={delegationManager}
        config={permissionConfig}
      />
    </div>
  );
}

