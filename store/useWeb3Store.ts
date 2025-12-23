import { create } from 'zustand';
import { ethers, BrowserProvider, Contract } from 'ethers';
import { ABI, CONTRACT_ADDRESS } from '../constants';
import { toast } from 'sonner';

interface Web3State {
    account: string | null;
    balance: string;
    isConnected: boolean;
    isConnecting: boolean;
    contract: Contract | null;
    provider: BrowserProvider | null;
    owner: string | null;
    isPaused: boolean;
    connectWallet: () => Promise<void>;
    disconnectWallet: () => void;
    refreshBalance: () => Promise<void>;
}

export const useWeb3Store = create<Web3State>((set, get) => ({
    account: null,
    balance: '0',
    isConnected: false,
    isConnecting: false,
    contract: null,
    provider: null,
    owner: null,
    isPaused: false,

    connectWallet: async () => {
        if (typeof window === 'undefined') return;

        const ethereum = (window as any).ethereum;

        if (!ethereum) {
            toast.error('Please install MetaMask!');
            return;
        }

        set({ isConnecting: true });

        try {
            // Request accounts - this triggers the popup
            await ethereum.request({ method: 'eth_requestAccounts' });
        } catch (err: any) {
            console.error("User rejected connection:", err);
            toast.error('Connection cancelled');
            set({ isConnecting: false });
            return; // Exit early
        }

        try {
            const provider = new ethers.BrowserProvider(ethereum);
            const network = await provider.getNetwork();

            // Sepolia Chain ID is 11155111 (0xaa36a7)
            if (network.chainId !== BigInt(11155111)) {
                try {
                    await ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }],
                    });
                    // If switch is successful, the code will continue below with the new chain.
                    // No need for a separate `newProvider` block here.
                } catch (switchError: any) {
                    // This error code indicates that the chain has not been added to MetaMask.
                    if (switchError.code === 4902) {
                        toast.error('Please add Sepolia network to MetaMask');
                    } else {
                        toast.error('Failed to switch to Sepolia');
                    }
                    set({ isConnecting: false }); // Stop connecting if switch fails
                    return; // Exit connectWallet if chain switch fails
                }
            }

            // Re-initialize provider after switch or if no switch was needed, to ensure it's on the correct network
            const currentProvider = new ethers.BrowserProvider(ethereum);
            const signer = await currentProvider.getSigner();
            const address = await signer.getAddress();

            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            // Fetch owner and paused status
            let ownerAddress: string | null = null;
            let pausedStatus = false;
            try {
                ownerAddress = await contract.owner();
                pausedStatus = await contract.paused();
            } catch (e) {
                console.error("Failed to fetch contract metadata (owner/paused)", e);
                // Continue without owner/paused if fetching fails, or handle as critical error
            }

            set({
                account: address,
                isConnected: true,
                provider: currentProvider,
                contract,
                owner: ownerAddress,
                isPaused: pausedStatus
            });

            await get().refreshBalance();
            toast.success('Wallet Connected!');

        } catch (error: any) {
            console.error("Wallet connection error:", error);
            // Handle user rejection - check multiple patterns
            if (error.code === 4001 || error.code === 'ACTION_REJECTED' || error?.info?.error?.code === 4001) {
                toast.error('Connection cancelled');
            } else if (error.message?.includes('rejected') || error.message?.includes('denied')) {
                toast.error('Connection cancelled');
            } else {
                toast.error(error.shortMessage || error.message || 'Failed to connect');
            }
            set({ isConnecting: false }); // Explicitly reset here too
        } finally {
            set({ isConnecting: false });
        }
    },

    disconnectWallet: () => {
        set({
            account: null,
            isConnected: false,
            contract: null,
            provider: null,
            balance: '0',
            owner: null,
            isPaused: false
        });
        toast.info('Wallet Disconnected');
    },

    refreshBalance: async () => {
        const { contract, account } = get();
        if (!contract || !account) return;

        try {
            const balance = await contract.balanceOf(account);
            const decimals = await contract.decimals(); // Should be 18
            const paused = await contract.paused(); // Fetch paused status
            set({
                balance: ethers.formatUnits(balance, decimals),
                isPaused: paused // Update paused status
            });
        } catch (error) {
            console.error("Failed to fetch balance or paused status", error);
        }
    }
}));
