"use client";

import { useWeb3Store } from "@/store/useWeb3Store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { ethers } from "ethers";
import { ArrowRightLeft, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

interface TransferFromFormData {
    from: string;
    to: string;
    amount: string;
}

export default function TransferFromForm() {
    const { contract, refreshBalance, isConnected, isPaused, account } = useWeb3Store();
    const [loading, setLoading] = useState(false);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [amount, setAmount] = useState("");

    const handleTransferFrom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contract) return;

        if (isPaused) {
            toast.error("Contract is currently paused");
            return;
        }

        if (!ethers.isAddress(from) || !ethers.isAddress(to)) {
            toast.error("Invalid address format");
            return;
        }

        if (from === ethers.ZeroAddress || to === ethers.ZeroAddress) {
            toast.error("Cannot transfer to/from zero address");
            return;
        }

        try {
            setLoading(true);
            const allowance = await contract.allowance(from, account);
            const formattedAmount = ethers.parseUnits(amount, 18);

            if (allowance < formattedAmount) {
                toast.error("Insufficient allowance. Please approve first.");
                setLoading(false);
                return;
            }

            const balance = await contract.balanceOf(from);
            if (balance < formattedAmount) {
                toast.error("Insufficient token balance");
                setLoading(false);
                return;
            }

            const tx = await contract.transferFrom(from, to, formattedAmount);
            toast.info("TransferFrom initiated...");
            await tx.wait();
            toast.success("TransferFrom successful!");
            setFrom("");
            setTo("");
            setAmount("");
            await refreshBalance();
        } catch (error: any) {
            console.error(error);
            try {
                const formattedAmount = ethers.parseUnits(amount, 18);
                await contract.transferFrom.staticCall(from, to, formattedAmount);
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
                <div className="p-2 rounded-lg bg-emerald-500/10">
                    <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Transfer From</h3>
                    <p className="text-sm text-muted-foreground">Use allowance</p>
                </div>
            </div>
            <form onSubmit={handleTransferFrom} className="space-y-3">
                <div className="space-y-1.5">
                    <Label htmlFor="from" className="text-xs text-muted-foreground">From</Label>
                    <Input
                        id="from"
                        placeholder="0x..."
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="bg-white/5 border-white/10 text-sm"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="to-tf" className="text-xs text-muted-foreground">To</Label>
                    <Input
                        id="to-tf"
                        placeholder="0x..."
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="bg-white/5 border-white/10 text-sm"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="amount-tf" className="text-xs text-muted-foreground">Amount</Label>
                    <Input
                        id="amount-tf"
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
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Transfer From"}
                </Button>
            </form>
        </div>
    );
}
