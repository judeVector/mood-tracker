#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("AsjZ3kWAUSQRNt2pZVeJkywhZ6gpLpHZmJjduPmKZDZZ");

#[program]
pub mod moodtracker {
    use super::*;

  pub fn close(_ctx: Context<CloseMoodtracker>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.moodtracker.count = ctx.accounts.moodtracker.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.moodtracker.count = ctx.accounts.moodtracker.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeMoodtracker>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.moodtracker.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeMoodtracker<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Moodtracker::INIT_SPACE,
  payer = payer
  )]
  pub moodtracker: Account<'info, Moodtracker>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseMoodtracker<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub moodtracker: Account<'info, Moodtracker>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub moodtracker: Account<'info, Moodtracker>,
}

#[account]
#[derive(InitSpace)]
pub struct Moodtracker {
  count: u8,
}
