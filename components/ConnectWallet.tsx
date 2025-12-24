"use client";

import { useWeb3Store } from "@/store/useWeb3Store";
import { Button } from "./ui/button";
import { Loader2, Wallet, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export default function ConnectWallet() {
    const { account, availableAccounts, connectWallet, disconnectWallet, switchAccount, isConnecting, isConnected } = useWeb3Store();
    const [showAccountMenu, setShowAccountMenu] = useState(false);
    const [switchingTo, setSwitchingTo] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

    useEffect(() => {
        const updatePosition = () => {
            if (menuRef.current) {
                const rect = menuRef.current.getBoundingClientRect();
                setMenuPosition({
                    top: rect.bottom + 8,
                    right: window.innerWidth - rect.right
                });
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                // Check if the click is inside the portal content (which is not in the DOM tree under menuRef)
                const portalElement = document.getElementById('account-dropdown-portal');
                if (portalElement && !portalElement.contains(event.target as Node)) {
                    setShowAccountMenu(false);
                }
            }
        };

        if (showAccountMenu) {
            updatePosition();
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            window.removeEventListener('scroll', updatePosition);
            window.removeEventListener('resize', updatePosition);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showAccountMenu]);

    const handleSwitchAccount = async (address: string) => {
        if (address === account) return;

        try {
            setSwitchingTo(address);
            await switchAccount(address);
            // Artificial delay to show the spinner and success state
            await new Promise(resolve => setTimeout(resolve, 500));
            setShowAccountMenu(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSwitchingTo(null);
        }
    };

    const DropdownContent = () => (
        <div
            id="account-dropdown-portal"
            className="fixed min-w-[280px] max-h-[320px] overflow-y-auto rounded-xl border border-white/10 shadow-xl animate-in fade-in zoom-in-95 duration-200"
            style={{
                background: 'rgba(20, 20, 25, 0.95)',
                backdropFilter: 'blur(16px)',
                zIndex: 99999,
                top: `${menuPosition.top}px`,
                right: `${menuPosition.right}px`
            }}
        >
            <div className="px-4 py-3 bg-white/5 border-b border-white/5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Switch Account
                </p>
            </div>
            <div className="p-2 space-y-1">
                {availableAccounts.map((address) => (
                    <button
                        key={address}
                        disabled={switchingTo !== null}
                        onClick={() => handleSwitchAccount(address)}
                        className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-mono transition-all flex items-center justify-between group ${address === account
                                ? 'bg-primary/20 text-primary border border-primary/20'
                                : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent disabled:opacity-50 disabled:cursor-not-allowed'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            {switchingTo === address && (
                                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            )}
                            <span className="truncate">{address.slice(0, 8)}...{address.slice(-6)}</span>
                        </div>
                        {address === account && !switchingTo && (
                            <span className="ml-2 text-primary font-bold animate-in fade-in zoom-in duration-300">✓</span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );

    if (isConnected && account) {
        return (
            <div className="flex items-center gap-2">
                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowAccountMenu(!showAccountMenu)}
                        className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-primary/20 backdrop-blur-md hover:bg-secondary/70 transition-colors"
                    >
                        <div className={`w-2 h-2 rounded-full ${switchingTo ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'} transition-colors duration-500`} />
                        <span className="font-mono text-sm text-primary">
                            {account.slice(0, 6)}...{account.slice(-4)}
                        </span>
                        {availableAccounts.length > 1 && (
                            <ChevronDown className={`w-4 h-4 text-primary transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                        )}
                    </button>

                    {showAccountMenu && availableAccounts.length > 1 && typeof document !== 'undefined' &&
                        createPortal(<DropdownContent />, document.body)
                    }
                </div>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={disconnectWallet}
                    className="rounded-full"
                >
                    Disconnect
                </Button>
            </div>
        );
    }

    return (
        <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300"
        >
            {isConnecting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                </>
            ) : (
                <>
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                </>
            )}
        </Button>
    );
}
