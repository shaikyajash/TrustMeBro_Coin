"use client";

import { useWeb3Store } from "@/store/useWeb3Store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { ethers } from "ethers";
import { CheckCircle2, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

interface ApproveFormData {
    spender: string;
    amount: string;
}

export default function ApproveForm() {
    const { contract, isConnected, isPaused } = useWeb3Store();
    const [loading, setLoading] = useState(false);
    const [spender, setSpender] = useState("");
    const [amount, setAmount] = useState("");

    const handleApprove = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contract) return;

        if (isPaused) {
            toast.error("Contract is currently paused");
            return;
        }

        if (!ethers.isAddress(spender) || spender === ethers.ZeroAddress) {
            toast.error("Invalid spender address");
            return;
        }

        try {
            setLoading(true);
            const formattedAmount = ethers.parseUnits(amount, 18);
            const tx = await contract.approve(spender, formattedAmount);
            toast.info("Approval initiated...");
            await tx.wait();
            toast.success("Approval successful!");
            setSpender("");
            setAmount("");
        } catch (error: any) {
            console.error(error);
            try {
                const formattedAmount = ethers.parseUnits(amount, 18);
                await contract.approve.staticCall(spender, formattedAmount);
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
                <div className="p-2 rounded-lg bg-amber-500/10">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Approve</h3>
                    <p className="text-sm text-muted-foreground">Set allowance</p>
                </div>
            </div>
            <form onSubmit={handleApprove} className="space-y-3">
                <div className="space-y-1.5">
                    <Label htmlFor="spender" className="text-xs text-muted-foreground">Spender</Label>
                    <Input
                        id="spender"
                        placeholder="0x..."
                        value={spender}
                        onChange={(e) => setSpender(e.target.value)}
                        className="bg-white/5 border-white/10 text-sm"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="approve-amount" className="text-xs text-muted-foreground">Amount</Label>
                    <Input
                        id="approve-amount"
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
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Approve"}
                </Button>
            </form>
        </div>
    );
}
