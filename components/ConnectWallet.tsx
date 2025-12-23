"use client";

import { useWeb3Store } from "@/store/useWeb3Store";
import { Button } from "./ui/button";
import { Loader2, Wallet } from "lucide-react";

export default function ConnectWallet() {
    const { account, connectWallet, disconnectWallet, isConnecting, isConnected } = useWeb3Store();

    if (isConnected && account) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full border border-primary/20 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="font-mono text-sm text-primary">
                        {account.slice(0, 6)}...{account.slice(-4)}
                    </span>
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
