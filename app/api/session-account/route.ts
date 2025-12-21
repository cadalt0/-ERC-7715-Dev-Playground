import { NextResponse } from 'next/server';
import { privateKeyToAccount } from 'viem/accounts';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';

/**
 * Get session account address and balance from server's private key
 * Returns only the public address and balance, never the private key
 */
export async function GET() {
  try {
    const serverSessionKey = process.env.SESSION_PRIVATE_KEY;
    
    if (!serverSessionKey) {
      return NextResponse.json(
        { error: 'Session key not configured on server. Set SESSION_PRIVATE_KEY in environment variables.' },
        { status: 500 }
      );
    }

    // Derive public address from private key
    const sessionAccount = privateKeyToAccount(serverSessionKey as `0x${string}`);
    
    // Get balance from network with fallback RPC endpoints
    // Prioritize reliable RPC providers (Infura, Alchemy, etc.)
    // Check for custom RPC URL in environment first
    const customRpcUrl = process.env.SEPOLIA_RPC_URL;
    
    const rpcEndpoints = [
      // Custom RPC URL (if provided) - highest priority
      ...(customRpcUrl ? [customRpcUrl] : []),
      // Reliable public endpoints (prioritized by reliability)
      'https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161', // Infura public endpoint (most reliable)
      'https://ethereum-sepolia-rpc.publicnode.com', // PublicNode (reliable)
      'https://rpc.sepolia.ethpandaops.io', // Ethereum Foundation public RPC
      'https://sepolia.gateway.tenderly.co', // Tenderly public RPC
      'https://rpc.sepolia.org', // Sepolia official (can be slow, last resort)
    ].filter(Boolean); // Remove any undefined/null values

    let balance: bigint | null = null;
    let feeData: any = null;
    let lastError: Error | null = null;

    // Try each RPC endpoint until one works
    for (const rpcUrl of rpcEndpoints) {
      try {
        const publicClient = createPublicClient({
          chain: sepolia,
          transport: http(rpcUrl, {
            timeout: 10000, // 10 second timeout
            retryCount: 2,
            retryDelay: 1000,
          }),
        });

        // Try to get balance with timeout
        const balancePromise = publicClient.getBalance({ address: sessionAccount.address });
        const timeoutPromise = new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('RPC timeout')), 7000)
        );
        
        balance = await Promise.race([balancePromise, timeoutPromise]);

        // Try to get fee data (non-blocking, use fallback if fails)
        try {
          const feePromise = publicClient.estimateFeesPerGas();
          const feeTimeoutPromise = new Promise<null>((resolve) => 
            setTimeout(() => resolve(null), 5000)
          );
          feeData = await Promise.race([feePromise, feeTimeoutPromise]);
        } catch {
          // Fee estimation failed, use fallback
          feeData = null;
        }

        // If we got here, the RPC worked
        break;
      } catch (error: any) {
        lastError = error;
        console.warn(`RPC endpoint ${rpcUrl} failed:`, error.message);
        // Try next endpoint
        continue;
      }
    }

    // If all endpoints failed, return address with error flag
    if (balance === null) {
      console.error('All RPC endpoints failed:', lastError?.message);
      return NextResponse.json({
        success: true,
        address: sessionAccount.address,
        balance: '0',
        balanceEth: '0.000000',
        estimatedGasCost: '0',
        estimatedGasCostEth: '0.000000',
        isLowBalance: true,
        warning: 'Unable to fetch balance from RPC. Please check manually on explorer.',
        error: lastError?.message || 'RPC timeout - could not fetch balance',
        rpcError: true,
      });
    }

    // Estimate minimum gas needed (rough estimate: 200k gas for delegation redemption)
    const estimatedGas = 200000n;
    const estimatedGasCost = feeData?.maxFeePerGas 
      ? estimatedGas * feeData.maxFeePerGas 
      : estimatedGas * 20000000000n; // Fallback: 20 gwei

    const toEth = (wei: bigint) => Number(wei) / 1e18;
    const bufferWei = (estimatedGasCost * 12n) / 10n; // 20% buffer, BigInt math only
    
    const balanceEth = toEth(balance);
    const estimatedGasCostEth = toEth(estimatedGasCost);
    const requiredEth = toEth(bufferWei);
    const isLowBalance = balance < bufferWei;

    // Return only the public address and balance (never the private key)
    return NextResponse.json({
      success: true,
      address: sessionAccount.address,
      balance: balance.toString(),
      balanceEth: balanceEth.toFixed(6),
      estimatedGasCost: estimatedGasCost.toString(),
      estimatedGasCostEth: estimatedGasCostEth.toFixed(6),
      isLowBalance,
      warning: isLowBalance 
        ? `Low balance! Need at least ${requiredEth.toFixed(6)} ETH for gas fees. Current: ${balanceEth.toFixed(6)} ETH`
        : null,
    });
  } catch (error: any) {
    console.error('Session account API error:', error);
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to get session account address',
      },
      { status: 500 }
    );
  }
}

