// Friendly error messages for contract errors
const ERROR_NAMES: Record<string, string> = {
    'TransferToZeroAddress': 'Cannot transfer to zero address',
    'TransferFromZeroAddress': 'Cannot transfer from zero address',
    'InsufficientBalance': 'Insufficient token balance',
    'ApproveToZeroAddress': 'Cannot approve zero address',
    'InsufficientAllowance': 'Insufficient allowance. Please approve first.',
    'NotTheOwner': 'Only the contract owner can do this',
    'ContractPaused': 'Contract is currently paused',
    'FaucetWouldExceedCap': 'Faucet would exceed token cap',
    'CapMustBeGreaterOrEqualInitialSupply': 'Initial supply must be less than or equal to cap',
    'NewOwnerIsZeroAddress': 'New owner cannot be zero address',
};

export function getErrorMessage(error: any): string {
    // 1. Check for user rejection
    if (error?.code === 4001 || error?.code === 'ACTION_REJECTED') {
        return 'Transaction was rejected';
    }

    // 2. Convert error to string for pattern matching
    const errorString = JSON.stringify(error) + (error?.message || '') + (error?.reason || '');

    // 3. Look for error name patterns in the stringified error
    for (const [errorName, friendlyMessage] of Object.entries(ERROR_NAMES)) {
        if (errorString.includes(errorName)) {
            return friendlyMessage;
        }
    }

    // 4. Check for common patterns in message
    const message = error?.message || error?.reason || '';

    if (message.includes('execution reverted') || error?.code === 'CALL_EXCEPTION' || errorString.includes('CALL_EXCEPTION')) {
        return 'Transaction failed. Please check your inputs.';
    }

    if (message.includes('insufficient funds')) {
        return 'Insufficient ETH for gas fees';
    }

    if (message.includes('nonce')) {
        return 'Transaction nonce error. Please refresh.';
    }

    // 5. Use shortMessage if available (ethers v6)
    if (error?.shortMessage) {
        return error.shortMessage;
    }

    // 6. Fallback
    if (message.length > 100) {
        return 'Transaction failed. Please try again.';
    }

    return message || 'An unexpected error occurred';
}
