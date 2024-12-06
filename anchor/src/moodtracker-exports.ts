// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import { Cluster, PublicKey } from "@solana/web3.js";
import MoodtrackerIDL from "../target/idl/mood_tracker.json";
import type { MoodTracker } from "../target/types/mood_tracker";

// Re-export the generated IDL and type
export { MoodTracker, MoodtrackerIDL };

// The programId is imported from the program IDL.
export const MOODTRACKER_PROGRAM_ID = new PublicKey(MoodtrackerIDL.address);

// This is a helper function to get the Moodtracker Anchor program.
export function getMoodtrackerProgram(provider: AnchorProvider) {
  return new Program(MoodtrackerIDL as MoodTracker, provider);
}

// This is a helper function to get the program ID for the Moodtracker program depending on the cluster.
export function getMoodtrackerProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
    case "testnet":
      // This is the program ID for the Moodtracker program on devnet and testnet.
      return new PublicKey("CounNZdmsQmWh7uVngV9FXW2dZ6zAgbJyYsvBpqbykg");
    case "mainnet-beta":
    default:
      return MOODTRACKER_PROGRAM_ID;
  }
}
