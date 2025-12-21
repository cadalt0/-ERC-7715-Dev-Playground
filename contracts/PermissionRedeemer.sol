// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PermissionRedeemer
 * @notice Contract that can redeem ERC-7715 permissions to execute USDC transfers
 * @dev Grant permission to this contract address, then call redeemUsdcPayment() to execute transfers
 */
interface IDelegationManager {
    function redeemDelegations(
        bytes[] calldata permissionContexts,
        bytes32[] calldata executionModes,
        bytes[] calldata executionCalldatas
    ) external;
}

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

contract PermissionRedeemer {
    IDelegationManager public immutable delegationManager;
    
    // Events
    event UsdcPaymentRedeemed(
        address indexed recipient,
        uint256 amount,
        bytes permissionsContext
    );
    
    /**
     * @param _delegationManager Address of the DelegationManager contract
     * @dev Get this from getSmartAccountsEnvironment(chainId).DelegationManager
     */
    constructor(address _delegationManager) {
        require(_delegationManager != address(0), "Invalid delegation manager");
        delegationManager = IDelegationManager(_delegationManager);
    }
    
    /**
     * @notice Redeem ERC-7715 permission to transfer USDC
     * @param permissionsContext The hex-encoded permissionsContext from the granted permission
     * @param usdcAddress Address of the USDC token contract
     * @param recipient Address that will receive the USDC
     * @param amount Amount of USDC to transfer (with 6 decimals, e.g., 1 USDC = 1000000)
     * @dev This function calls DelegationManager.redeemDelegations() which verifies
     *      the permission and executes the USDC transfer if valid
     */
    function redeemUsdcPayment(
        bytes calldata permissionsContext,
        address usdcAddress,
        address recipient,
        uint256 amount
    ) external {
        require(usdcAddress != address(0), "Invalid USDC address");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        
        // Build USDC transfer calldata
        // transfer(address to, uint256 amount)
        bytes memory transferCalldata = abi.encodeWithSignature(
            "transfer(address,uint256)",
            recipient,
            amount
        );
        
        // Encode execution as ExecutionStruct: (target, value, callData)
        // For single execution, JS uses encodePacked(["address", "uint256", "bytes"], ...)
        // In Solidity, we need to manually construct the packed format:
        // address (20 bytes) + uint256 (32 bytes) + bytes (variable, no length prefix in packed)
        // Since encodePacked with bytes doesn't include length, we manually concatenate
        bytes memory executionCalldata = abi.encodePacked(
            usdcAddress,    // target (address) - 20 bytes
            uint256(0),     // value (uint256) - 32 bytes  
            transferCalldata // callData (bytes) - variable length, no length prefix
        );
        
        // Redeem the permission via DelegationManager
        // ExecutionMode.SingleDefault = 0x0000...0000
        bytes[] memory permissionContexts = new bytes[](1);
        permissionContexts[0] = permissionsContext;
        
        bytes32[] memory executionModes = new bytes32[](1);
        executionModes[0] = bytes32(0); // SingleDefault execution mode
        
        bytes[] memory executionCalldatas = new bytes[](1);
        executionCalldatas[0] = executionCalldata;
        
        delegationManager.redeemDelegations(
            permissionContexts,     // Array of permission contexts
            executionModes,          // Array of execution modes
            executionCalldatas       // Array of execution calldatas
        );
        
        emit UsdcPaymentRedeemed(recipient, amount, permissionsContext);
    }
    
    /**
     * @notice Redeem permission to transfer any ERC-20 token (not just USDC)
     * @param permissionsContext The hex-encoded permissionsContext from the granted permission
     * @param tokenAddress Address of the ERC-20 token contract
     * @param recipient Address that will receive the tokens
     * @param amount Amount of tokens to transfer (with token's decimals)
     */
    function redeemTokenPayment(
        bytes calldata permissionsContext,
        address tokenAddress,
        address recipient,
        uint256 amount
    ) external {
        require(tokenAddress != address(0), "Invalid token address");
        require(recipient != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be greater than 0");
        
        // Build ERC-20 transfer calldata
        bytes memory transferCalldata = abi.encodeWithSignature(
            "transfer(address,uint256)",
            recipient,
            amount
        );
        
        // Encode execution as ExecutionStruct: (target, value, callData)
        bytes memory executionCalldata = abi.encodePacked(
            tokenAddress,   // target (address)
            uint256(0),    // value (uint256)
            transferCalldata // callData (bytes)
        );
        
        // Redeem the permission
        bytes[] memory permissionContexts = new bytes[](1);
        permissionContexts[0] = permissionsContext;
        
        bytes32[] memory executionModes = new bytes32[](1);
        executionModes[0] = bytes32(0); // SingleDefault execution mode
        
        bytes[] memory executionCalldatas = new bytes[](1);
        executionCalldatas[0] = executionCalldata;
        
        delegationManager.redeemDelegations(
            permissionContexts,
            executionModes,  // Array of execution modes
            executionCalldatas
        );
    }
    
    /**
     * @notice Get the DelegationManager address
     * @return The address of the DelegationManager contract
     */
    function getDelegationManager() external view returns (address) {
        return address(delegationManager);
    }
}

