/**
 * Backend API client for redeeming permissions
 * This calls the backend API route instead of executing directly in the browser
 */

export interface RedeemRequest {
  permissionsContext: string;
  delegationManager: string;
  recipient: string;
  amount: string;
  permissionType: 'native-token-periodic' | 'erc20-token-periodic';
  tokenAddress?: string;
  tokenDecimals?: number;
  // Note: sessionPrivateKey is NOT sent from frontend - backend uses its own from env
}

export interface RedeemResponse {
  success: boolean;
  transactionHash?: string;
  recipient?: string;
  amountUsdc?: string;
  sessionAccountAddress?: string;
  delegationManagerAddress?: string;
  message?: string;
  error?: string;
  details?: string;
}

export async function redeemPermissionViaBackend(
  permissionsContext: string,
  delegationManager: string,
  recipient: string,
  amount: string,
  permissionType: 'native-token-periodic' | 'erc20-token-periodic',
  tokenAddress?: string,
  tokenDecimals?: number,
): Promise<RedeemResponse> {
  // Call backend API - backend will use its own SESSION_PRIVATE_KEY
  // Frontend doesn't need to send the key (more secure)
  const response = await fetch('/api/redeem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      permissionsContext,
      delegationManager,
      recipient,
      amount,
      permissionType,
      tokenAddress,
      tokenDecimals,
      // Don't send sessionPrivateKey from frontend - backend uses its own
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.details || 'Failed to redeem permission');
  }

  return data;
}

