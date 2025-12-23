"use client";

import ConnectWallet from "@/components/ConnectWallet";
import FaucetClaim from "@/components/FaucetClaim";
import TransferForm from "@/components/TransferForm";
import ApproveForm from "@/components/ApproveForm";
import TransferFromForm from "@/components/TransferFromForm";
import AllowanceCheck from "@/components/AllowanceCheck";
import OwnerControls from "@/components/OwnerControls";
import { useWeb3Store } from "@/store/useWeb3Store";

export default function Home() {
  const { isConnected, balance, contract } = useWeb3Store();

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
            <p className="text-xs text-muted-foreground font-mono">SEPOLIA TESTNET</p>
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
          <div className="space-y-8">
            {/* Balance Section */}
            <div className="glass-card p-8 rounded-2xl text-center">
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-1">Your Balance</p>
              <h2 className="text-5xl md:text-6xl font-bold text-white tabular-nums">
                {parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
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
