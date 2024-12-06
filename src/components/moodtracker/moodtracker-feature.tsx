"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletButton } from "../solana/solana-provider";
import { AppHero, ellipsify } from "../ui/ui-layout";
import { ExplorerLink } from "../cluster/cluster-ui";
import { useMoodtrackerProgram } from "./moodtracker-data-access";
import { MoodtrackerCreate, MoodtrackerList } from "./moodtracker-ui";

export default function MoodtrackerFeature() {
  const { publicKey } = useWallet();
  const { programId } = useMoodtrackerProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Moodtracker"
        subtitle={
          'Create a new mood entry by clicking the "Submit" button. Each mood entry is stored on-chain, allowing you to securely log and manage your moods by interacting with the program\'s methods (update, delete, and view).'
        }
      >
        <p className="mb-6">
          <ExplorerLink path={`account/${programId}`} label={ellipsify(programId.toString())} />
        </p>
        <MoodtrackerCreate />
      </AppHero>
      <MoodtrackerList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
