"use client";

import { useWeb3Store } from "@/store/useWeb3Store";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

export default function FaucetClaim() {
    const { contract, refreshBalance, isConnected } = useWeb3Store();
    const [loading, setLoading] = useState(false);

    const handleClaim = async () => {
        if (!contract) return;
        try {
            setLoading(true);
            const tx = await contract.claimFaucet();
            toast.info("Transaction sent! Waiting for confirmation...");
            await tx.wait();
            toast.success("Faucet claimed successfully! 10 TMB added.");
            await refreshBalance();
        } catch (error: any) {
            console.error(error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10">
                    <Coins className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Faucet</h3>
                    <p className="text-sm text-muted-foreground">Claim free tokens</p>
                </div>
            </div>
            <Button
                onClick={handleClaim}
                disabled={!isConnected || loading}
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Claiming...
                    </>
                ) : (
                    "Claim 10 TMB"
                )}
            </Button>
        </div>
    );
}
