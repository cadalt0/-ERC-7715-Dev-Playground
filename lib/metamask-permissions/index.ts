/**
 * Main entry point for MetaMask Permissions
 * Exports all public functions
 */

// Wallet functions
export { connectWallet, setupWalletClient, connectWalletInternal } from './wallet';

// Permission request functions
export { requestUsdcPermission } from './request';
export { requestCustomPermission } from './request-custom';

// Account functions
export { checkAccountUpgrade } from './account';

// Deployment functions
export { deploySmartAccountManually } from './deploy';

// Utility functions
export { setupPublicClient, setupSessionAccount, createSessionAccountFromAddress, wrapEthereumProvider } from './utils';

// Constants
export { USDC_SEPOLIA, ERC20_ABI } from './constants';

// Types
export type { PermissionConfig, PermissionType, TokenInfo, PeriodDurationOption } from './types';
export { COMMON_TOKENS, NATIVE_TOKEN, PERIOD_DURATION_OPTIONS } from './types';

// DelegationManager helper
export { getDelegationManagerAddress } from './delegation-manager';

