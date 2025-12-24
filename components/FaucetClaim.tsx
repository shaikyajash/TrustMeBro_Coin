"use client";

import { useWeb3Store } from "@/store/useWeb3Store";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { ethers } from "ethers";
import { Coins, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

export default function FaucetClaim() {
    const { contract, refreshBalance, isConnected, account, isPaused } = useWeb3Store();
    const [loading, setLoading] = useState(false);

    const handleClaim = async () => {
        if (!contract || !account) return;

        if (isPaused) {
            toast.error("Contract is currently paused");
            return;
        }

        try {
            setLoading(true);

            const cap = await contract.cap();
            const totalSupply = await contract.totalSupply();
            const faucetAmount = ethers.parseUnits("10", 18);

            if (totalSupply + faucetAmount > cap) {
                toast.error("Faucet would exceed token cap");
                setLoading(false);
                return;
            }

            const hasClaimed = await contract.hasClaimedFaucet(account);
            if (hasClaimed) {
                toast.error("You have already claimed from the faucet");
                return;
            }

            const tx = await contract.claimFaucet();
            toast.info("Transaction sent! Waiting for confirmation...");
            await tx.wait();
            toast.success("Faucet claimed successfully! 10 TMB added.");
            await refreshBalance();
        } catch (error: any) {
            console.error(error);
            try {
                await contract.claimFaucet.staticCall();
            } catch (staticError: any) {
                toast.error(getErrorMessage(staticError));
                return;
            }
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
