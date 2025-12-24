"use client";

import { useWeb3Store } from "@/store/useWeb3Store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { ethers } from "ethers";
import { Send, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

interface TransferFormData {
    to: string;
    amount: string;
}

export default function TransferForm() {
    const { contract, refreshBalance, isConnected, isPaused, balance } = useWeb3Store();
    const [loading, setLoading] = useState(false);
    const [to, setTo] = useState("");
    const [amount, setAmount] = useState("");

    const handleTransfer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contract) return;

        if (isPaused) {
            toast.error("Contract is currently paused");
            return;
        }

        if (parseFloat(amount) > parseFloat(balance)) {
            toast.error("Insufficient token balance");
            return;
        }

        try {
            setLoading(true);
            const formattedAmount = ethers.parseUnits(amount, 18);

            const tx = await contract.transfer(to, formattedAmount);

            toast.info("Transfer initiated...");
            await tx.wait();
            toast.success("Transfer successful!");
            setTo("");
            setAmount("");
            await refreshBalance();
        } catch (error: any) {
            console.error(error);
            try {
                const formattedAmount = ethers.parseUnits(amount, 18);
                await contract.transfer.staticCall(to, formattedAmount);
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
                <div className="p-2 rounded-lg bg-cyan-500/10">
                    <Send className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Transfer</h3>
                    <p className="text-sm text-muted-foreground">Send tokens</p>
                </div>
            </div>
            <form onSubmit={handleTransfer} className="space-y-3">
                <div className="space-y-1.5">
                    <Label htmlFor="to" className="text-xs text-muted-foreground">Recipient</Label>
                    <Input
                        id="to"
                        placeholder="0x..."
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="bg-white/5 border-white/10 text-sm"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs text-muted-foreground">Amount</Label>
                    <Input
                        id="amount"
                        type="number"
                        placeholder="0.0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-white/5 border-white/10 text-sm"
                        required
                        step="0.000001"
                    />
                </div>
                <Button
                    type="submit"
                    disabled={!isConnected || loading}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Transfer"}
                </Button>
            </form>
        </div>
    );
}
