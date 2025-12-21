/**
 * Constants for MetaMask Permissions
 */

// USDC address on Ethereum Sepolia (from MetaMask docs)
export const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

// Minimal ERC-20 ABI for transfer, used when redeeming permissions
export const ERC20_ABI = [
  {
    type: 'function',
    name: 'transfer',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

