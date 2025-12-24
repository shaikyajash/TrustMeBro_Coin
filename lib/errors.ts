export function getErrorMessage(error: any): string {
    // 1. Check for user rejection explicitly first
    if (error?.code === 4001 || error?.code === 'ACTION_REJECTED' || error?.info?.error?.code === 4001) {
        return 'Transaction was rejected';
    }

    // 2. Handle Race Conditions / Reverts without data
    if (error?.code === 'CALL_EXCEPTION') {
        return 'Transaction reverted (possibly due to race condition or state change).';
    }

    // 3. Generic Error Extraction
    const message = error?.reason || error?.shortMessage || error?.message || '';

    if (message.includes('insufficient funds')) {
        return 'Insufficient ETH for gas fees';
    }

    if (message.includes('nonce')) {
        return 'Transaction nonce error. Please refresh.';
    }

    // Fallback
    return message || 'Transaction failed. Please check your inputs.';
}
