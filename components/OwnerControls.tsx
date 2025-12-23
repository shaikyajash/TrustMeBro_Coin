"use client";

import { useWeb3Store } from "@/store/useWeb3Store";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { ShieldAlert, PlayCircle, PauseCircle, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

export default function OwnerControls() {
    const { contract, owner, account, isPaused, refreshBalance } = useWeb3Store();
    const [loading, setLoading] = useState(false);

    const isOwner = account && owner && account.toLowerCase() === owner.toLowerCase();

    if (!isOwner) return null;

    const togglePause = async () => {
        if (!contract) return;
        try {
            setLoading(true);
            let tx;
            if (isPaused) {
                tx = await contract.unpause();
                toast.info("Unpausing contract...");
            } else {
                tx = await contract.pause();
                toast.info("Pausing contract...");
            }
            await tx.wait();
            toast.success(isPaused ? "Contract Unpaused!" : "Contract Paused!");
            await refreshBalance();
        } catch (error: any) {
            console.error(error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card rounded-xl p-5 border-red-500/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                        <ShieldAlert className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Owner Controls</h3>
                        <p className="text-sm text-muted-foreground">
                            Status: <span className={isPaused ? "text-orange-400" : "text-green-400"}>
                                {isPaused ? "Paused" : "Active"}
                            </span>
                        </p>
                    </div>
                </div>
                <Button
                    onClick={togglePause}
                    disabled={loading}
                    variant={isPaused ? "default" : "destructive"}
                    size="sm"
                >
                    {loading ? (
                        <Loader2 className="animate-spin h-4 w-4" />
                    ) : isPaused ? (
                        <><PlayCircle className="mr-1 h-4 w-4" /> Unpause</>
                    ) : (
                        <><PauseCircle className="mr-1 h-4 w-4" /> Pause</>
                    )}
                </Button>
            </div>
        </div>
    );
}
