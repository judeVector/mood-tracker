"use client";

import { getMoodtrackerProgram, getMoodtrackerProgramId } from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import { Cluster, Keypair, PublicKey } from "@solana/web3.js";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";

interface CreateEntryArgs {
  title: string;
  description: string;
  owner: PublicKey;
}

export function useMoodtrackerProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(() => getMoodtrackerProgramId(cluster.network as Cluster), [cluster]);
  const program = getMoodtrackerProgram(provider);

  const accounts = useQuery({
    queryKey: ["moodtracker", "all", { cluster }],
    queryFn: () => program.account.mood.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["moodEntry", "create", { cluster }],

    mutationFn: async ({ title, description, owner }) => {
      const [moodAddress] = PublicKey.findProgramAddressSync(
        [Buffer.from(title), owner.toBuffer()],
        programId
      );

      return program.methods.createMood(title, description).rpc();
    },

    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: (error) => toast.error("Failed to initialize account"),
  });

  return {
    program,
    accounts,
    programId,
    getProgramAccount,
    createEntry,
  };
}

export function useMoodtrackerProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useMoodtrackerProgram();

  const accountQuery = useQuery({
    queryKey: ["moodtracker", "fetch", { cluster, account }],
    queryFn: () => program.account.mood.fetch(account),
  });

  const updateMood = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ["moodEntry", "update", { cluster }],
    mutationFn: async ({ title, description }) => {
      return program.methods.updateMood(title, description).rpc();
    },

    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error updating mood: ${error.message}`);
    },
  });

  const deleteMood = useMutation({
    mutationKey: ["moodEntry", "delete", { cluster }],
    mutationFn: async (title: string) => {
      return program.methods.deleteMood(title).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
  });

  return {
    accountQuery,
    updateMood,
    deleteMood,
  };
}
