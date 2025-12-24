import { create } from 'zustand';
import { ethers, BrowserProvider, Contract } from 'ethers';
import { ABI, CONTRACT_ADDRESS } from '../constants';
import { toast } from 'sonner';

interface Web3State {
    account: string | null;
    availableAccounts: string[];
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
    switchAccount: (address: string) => Promise<void>;
}

export const useWeb3Store = create<Web3State>((set, get) => ({
    account: null,
    availableAccounts: [],
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
            await ethereum.request({ method: 'eth_requestAccounts' });
        } catch (err: any) {
            console.error("User rejected connection:", err);
            toast.error('Connection cancelled');
            set({ isConnecting: false });
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(ethereum);
            const network = await provider.getNetwork();

            if (network.chainId !== BigInt(11155111)) {
                try {
                    await ethereum.request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: '0xaa36a7' }],
                    });
                } catch (switchError: any) {
                    if (switchError.code === 4902) {
                        toast.error('Please add Sepolia network to MetaMask');
                    } else {
                        toast.error('Failed to switch to Sepolia');
                    }
                    set({ isConnecting: false });
                    return;
                }
            }

            const currentProvider = new ethers.BrowserProvider(ethereum);
            const accounts = await currentProvider.listAccounts();
            const signer = await currentProvider.getSigner();
            const address = await signer.getAddress();

            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            let ownerAddress: string | null = null;
            let pausedStatus = false;
            try {
                ownerAddress = await contract.owner();
                pausedStatus = await contract.paused();
            } catch (e) {
                console.error("Failed to fetch contract metadata", e);
            }

            const availableAccounts = accounts.map(acc => acc.address);

            set({
                account: address,
                availableAccounts,
                isConnected: true,
                provider: currentProvider,
                contract,
                owner: ownerAddress,
                isPaused: pausedStatus
            });

            ethereum.on('accountsChanged', async (newAccounts: string[]) => {
                if (newAccounts.length === 0) {
                    get().disconnectWallet();
                } else {
                    await get().switchAccount(newAccounts[0]);
                }
            });

            await get().refreshBalance();
            toast.success('Wallet Connected!');

        } catch (error: any) {
            console.error("Wallet connection error:", error);
            if (error.code === 4001 || error.code === 'ACTION_REJECTED' || error?.info?.error?.code === 4001) {
                toast.error('Connection cancelled');
            } else if (error.message?.includes('rejected') || error.message?.includes('denied')) {
                toast.error('Connection cancelled');
            } else {
                toast.error(error.shortMessage || error.message || 'Failed to connect');
            }
            set({ isConnecting: false });
        } finally {
            set({ isConnecting: false });
        }
    },

    switchAccount: async (address: string) => {
        const { provider } = get();
        if (!provider) return;

        try {
            const signer = await provider.getSigner(address);
            const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

            let ownerAddress: string | null = null;
            let pausedStatus = false;
            try {
                ownerAddress = await contract.owner();
                pausedStatus = await contract.paused();
            } catch (e) {
                console.error("Failed to fetch contract metadata", e);
            }

            set({
                account: address,
                contract,
                owner: ownerAddress,
                isPaused: pausedStatus
            });

            await get().refreshBalance();
            toast.success('Account switched!');
        } catch (error) {
            console.error("Failed to switch account:", error);
            toast.error('Failed to switch account');
        }
    },

    disconnectWallet: () => {
        const ethereum = (window as any).ethereum;
        if (ethereum) {
            ethereum.removeAllListeners('accountsChanged');
        }

        set({
            account: null,
            availableAccounts: [],
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
            const decimals = await contract.decimals();
            const paused = await contract.paused();
            set({
                balance: ethers.formatUnits(balance, decimals),
                isPaused: paused
            });
        } catch (error) {
            console.error("Failed to fetch balance or paused status", error);
        }
    }
}));
