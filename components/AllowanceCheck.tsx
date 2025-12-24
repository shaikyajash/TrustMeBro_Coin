"use client";

import { useWeb3Store } from "@/store/useWeb3Store";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "sonner";
import { useState } from "react";
import { ethers } from "ethers";
import { Eye, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

interface AllowanceFormData {
    owner: string;
    spender: string;
}

export default function AllowanceCheck() {
    const { contract, account, isConnected } = useWeb3Store();
    const [loading, setLoading] = useState(false);
    const [owner, setOwner] = useState("");
    const [spender, setSpender] = useState("");
    const [allowance, setAllowance] = useState<string | null>(null);

    const handleCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contract) return;
        try {
            setLoading(true);
            const result = await contract.allowance(owner, spender);
            const formatted = ethers.formatUnits(result, 18);
            setAllowance(formatted);
            toast.success(`Allowance: ${formatted} TMB`);
        } catch (error: any) {
            console.error(error);
            toast.error(getErrorMessage(error));
            setAllowance(null);
        } finally {
            setLoading(false);
        }
    };

    const fillMyAddress = () => {
        if (account) setOwner(account);
    };

    return (
        <div className="glass-card rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-500/10">
                    <Eye className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">Check Allowance</h3>
                    <p className="text-sm text-muted-foreground">View spending limit</p>
                </div>
            </div>
            <form onSubmit={handleCheck} className="space-y-3">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="allowance-owner" className="text-xs text-muted-foreground">Owner</Label>
                        <button type="button" onClick={fillMyAddress} className="text-xs text-violet-400 hover:underline">
                            Use my address
                        </button>
                    </div>
                    <Input
                        id="allowance-owner"
                        placeholder="0x..."
                        value={owner}
                        onChange={(e) => setOwner(e.target.value)}
                        className="bg-white/5 border-white/10 text-sm"
                        required
                    />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="allowance-spender" className="text-xs text-muted-foreground">Spender</Label>
                    <Input
                        id="allowance-spender"
                        placeholder="0x..."
                        value={spender}
                        onChange={(e) => setSpender(e.target.value)}
                        className="bg-white/5 border-white/10 text-sm"
                        required
                    />
                </div>
                <Button
                    type="submit"
                    disabled={!isConnected || loading}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Check Allowance"}
                </Button>
            </form>
            {allowance !== null && (
                <div className="p-3 rounded-lg bg-violet-500/10 text-center">
                    <p className="text-sm text-muted-foreground">Allowance</p>
                    <p className="text-xl font-bold text-white">{parseFloat(allowance).toLocaleString()} <span className="text-violet-400">TMB</span></p>
                </div>
            )}
        </div>
    );
}
