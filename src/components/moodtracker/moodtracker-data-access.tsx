'use client'

import {getMoodtrackerProgram, getMoodtrackerProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useMoodtrackerProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getMoodtrackerProgramId(cluster.network as Cluster), [cluster])
  const program = getMoodtrackerProgram(provider)

  const accounts = useQuery({
    queryKey: ['moodtracker', 'all', { cluster }],
    queryFn: () => program.account.moodtracker.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['moodtracker', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ moodtracker: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useMoodtrackerProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useMoodtrackerProgram()

  const accountQuery = useQuery({
    queryKey: ['moodtracker', 'fetch', { cluster, account }],
    queryFn: () => program.account.moodtracker.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['moodtracker', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ moodtracker: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['moodtracker', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ moodtracker: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['moodtracker', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ moodtracker: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['moodtracker', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ moodtracker: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
