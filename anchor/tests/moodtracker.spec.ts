import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Moodtracker} from '../target/types/moodtracker'

describe('moodtracker', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Moodtracker as Program<Moodtracker>

  const moodtrackerKeypair = Keypair.generate()

  it('Initialize Moodtracker', async () => {
    await program.methods
      .initialize()
      .accounts({
        moodtracker: moodtrackerKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([moodtrackerKeypair])
      .rpc()

    const currentCount = await program.account.moodtracker.fetch(moodtrackerKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Moodtracker', async () => {
    await program.methods.increment().accounts({ moodtracker: moodtrackerKeypair.publicKey }).rpc()

    const currentCount = await program.account.moodtracker.fetch(moodtrackerKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Moodtracker Again', async () => {
    await program.methods.increment().accounts({ moodtracker: moodtrackerKeypair.publicKey }).rpc()

    const currentCount = await program.account.moodtracker.fetch(moodtrackerKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Moodtracker', async () => {
    await program.methods.decrement().accounts({ moodtracker: moodtrackerKeypair.publicKey }).rpc()

    const currentCount = await program.account.moodtracker.fetch(moodtrackerKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set moodtracker value', async () => {
    await program.methods.set(42).accounts({ moodtracker: moodtrackerKeypair.publicKey }).rpc()

    const currentCount = await program.account.moodtracker.fetch(moodtrackerKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the moodtracker account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        moodtracker: moodtrackerKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.moodtracker.fetchNullable(moodtrackerKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
