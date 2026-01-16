/**
 * Types for ERC-7715 Permission Requests
 */

export type PermissionType = 
  | 'native-token-periodic' 
  | 'erc20-token-periodic'
  | 'native-token-stream'
  | 'erc20-token-stream';

export interface PermissionConfig {
  permissionType: PermissionType;
  tokenAddress?: string; // Only for ERC-20 tokens
  
  // Periodic permission fields
  amount?: string; // periodAmount for periodic permissions
  periodDuration?: number; // in seconds (for periodic)
  
  // Stream permission fields
  amountPerSecond?: string; // For stream permissions
  initialAmount?: string; // For stream permissions
  maxAmount?: string; // For stream permissions
  
  // Common fields
  tokenDecimals: number;
  startTime?: number; // Unix timestamp in seconds (for both native periodic and stream)
  expiry: number; // Unix timestamp in seconds
  justification: string;
  isAdjustmentAllowed: boolean;
  chainId: number;
}

export interface PeriodDurationOption {
  label: string;
  value: number; // in seconds
}

export const PERIOD_DURATION_OPTIONS: PeriodDurationOption[] = [
  { label: 'Every Hour', value: 3600 },
  { label: 'Every 6 Hours', value: 21600 },
  { label: 'Every 12 Hours', value: 43200 },
  { label: 'Every Day', value: 86400 },
  { label: 'Every Week', value: 604800 },
  { label: 'Every Month', value: 2592000 },
];

export interface TokenInfo {
  address: string | null; // null for native ETH
  symbol: string;
  decimals: number;
  name: string;
  isNative?: boolean;
}

// Native ETH token
export const NATIVE_TOKEN: TokenInfo = {
  address: null,
  symbol: 'ETH',
  decimals: 18,
  name: 'Ethereum',
  isNative: true,
};

export const COMMON_TOKENS: TokenInfo[] = [
  NATIVE_TOKEN, // Default: Native ETH
  {
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // USDC Sepolia
    symbol: 'USDC',
    decimals: 6,
    name: 'USD Coin',
    isNative: false,
  },
];

