import { NextRequest, NextResponse } from 'next/server';
import { redeemPermission } from '@/lib/redeem-server';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { permissionsContext, delegationManager, recipient, amount, permissionType, tokenAddress, tokenDecimals } = body;

    // Validate required fields
    if (!permissionsContext || !delegationManager || !recipient || !amount || !permissionType) {
      return NextResponse.json(
        { error: 'Missing required fields: permissionsContext, delegationManager, recipient, amount, permissionType' },
        { status: 400 }
      );
    }

    // Get session key from server environment (more secure - not exposed to frontend)
    const serverSessionKey = process.env.SESSION_PRIVATE_KEY;
    if (!serverSessionKey) {
      return NextResponse.json(
        { error: 'Session key not configured on server. Set SESSION_PRIVATE_KEY in environment variables.' },
        { status: 500 }
      );
    }

    // Check session account balance before redeeming
    // Use reliable RPC endpoint
    const customRpcUrl = process.env.SEPOLIA_RPC_URL;
    const rpcUrl = customRpcUrl || 'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
    
    const publicClient = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl, {
        timeout: 10000,
        retryCount: 2,
        retryDelay: 1000,
      }),
    });

    const sessionAccount = privateKeyToAccount(serverSessionKey as `0x${string}`);
    const sessionBalance = await publicClient.getBalance({
      address: sessionAccount.address,
    });

    // Estimate minimum gas needed (rough estimate: 200k gas for delegation redemption)
    const estimatedGas = 200000n;
    const feeData = await publicClient.estimateFeesPerGas().catch(() => null);
    const estimatedGasCost = feeData?.maxFeePerGas 
      ? estimatedGas * feeData.maxFeePerGas 
      : estimatedGas * 20000000000n; // Fallback: 20 gwei

    if (sessionBalance < estimatedGasCost) {
      return NextResponse.json(
        {
          error: 'Insufficient ETH in session account for gas fees',
          details: {
            sessionAccount: sessionAccount.address,
            balance: `${(Number(sessionBalance) / 1e18).toFixed(6)} ETH`,
            estimatedGasCost: `${(Number(estimatedGasCost) / 1e18).toFixed(6)} ETH`,
            required: `${(Number(estimatedGasCost * 120n / 100n) / 1e18).toFixed(6)} ETH (with 20% buffer)`,
          },
        },
        { status: 400 }
      );
    }

    // Redeem the permission (backend execution)
    // Uses server's session key - frontend never sees it
    const result = await redeemPermission(
      permissionsContext,
      delegationManager,
      serverSessionKey,
      recipient,
      amount,
      permissionType,
      tokenAddress,
      tokenDecimals,
    );

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    // Log error without exposing sensitive data
    console.error('Redeem API error:', {
      message: error?.message,
      // Never log private keys or sensitive data
    });
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to redeem permission',
        // Never expose private keys or sensitive data in error responses
      },
      { status: 500 }
    );
  }
}

