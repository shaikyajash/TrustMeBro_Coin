"use client";

import ConnectWallet from "@/components/ConnectWallet";
import FaucetClaim from "@/components/FaucetClaim";
import TransferForm from "@/components/TransferForm";
import ApproveForm from "@/components/ApproveForm";
import TransferFromForm from "@/components/TransferFromForm";
import AllowanceCheck from "@/components/AllowanceCheck";
import OwnerControls from "@/components/OwnerControls";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { useWeb3Store } from "@/store/useWeb3Store";
import { useEffect, useRef, useState } from "react";

// Sub-component for animated number
function AnimatedBalance({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState(parseFloat(value));
  const previousValue = useRef(parseFloat(value));
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    const target = parseFloat(value);
    const start = previousValue.current;
    const startTime = performance.now();
    const duration = 1000; // 1 second animation

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic function for smooth settling
      const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeProgress = easeOutCubic(progress);

      const current = start + (target - start) * easeProgress;
      setDisplayValue(current);

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        previousValue.current = target;
      }
    };

    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [value]);

  return (
    <span className="tabular-nums">
      {displayValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
    </span>
  );
}

export default function Home() {
  const { isConnected, balance, contract, refreshBalance } = useWeb3Store();

  return (
    <main className="min-h-screen dotted-bg text-white relative overflow-hidden">
      {/* Subtle Glow Orbs */}
      <div className="fixed top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-20 right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-6 py-8 relative z-10 max-w-6xl">
        {/* Header */}
        <nav className="flex justify-between items-center mb-16 glass-card p-5 rounded-2xl">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              TrustMeBro
            </h1>
            <p className="text-xs text-muted-foreground font-mono">ETH SEPOLIA</p>
          </div>
          <ConnectWallet />
        </nav>

        {!isConnected ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">
                Trust Me Bro,
                <span className="block text-purple-400">It's Legit 💯</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Definitely not a scam. <br /> 😉 Connect your wallet and find out.
              </p>
            </div>
            <ConnectWallet />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Balance Section */}
            <div className="glass-card p-8 rounded-2xl text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

              <div className="absolute top-4 right-4 z-20">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
                  onClick={async () => {
                    const btn = document.getElementById('refresh-icon');
                    btn?.classList.add('animate-spin');
                    await refreshBalance();
                    setTimeout(() => btn?.classList.remove('animate-spin'), 1000);
                    toast.success("Balance & Status refreshed");
                  }}
                >
                  <RefreshCw id="refresh-icon" className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-1 relative z-10">Your Balance</p>
              <h2 className="text-5xl md:text-6xl font-bold text-white relative z-10">
                <AnimatedBalance value={balance} />
                <span className="text-xl ml-2 text-purple-400 font-normal">TMB</span>
              </h2>
            </div>

            {/* Owner Controls - Separate Section */}
            <OwnerControls />

            {/* Action Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FaucetClaim />
              <TransferForm />
              <ApproveForm />
              <AllowanceCheck />
              <TransferFromForm />
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-muted-foreground pt-8 border-t border-border">
              Contract: <code className="text-purple-400/80">{String(contract?.target || '')}</code>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
