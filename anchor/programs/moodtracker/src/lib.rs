use anchor_lang::prelude::*;

declare_id!("7eBNuwi4ohvPFWbbb3E1HXhUedAENMLfE5KetRJ7QuLn");

#[program]
pub mod mood_tracker {
    use super::*;

    pub fn create_mood(ctx: Context<CreateMood>, title: String, description: String) -> Result<()> {
        let mood_entry = &mut ctx.accounts.mood;

        mood_entry.title = title;
        mood_entry.description = description;
        mood_entry.owner = *ctx.accounts.signer.key;

        // Automatically set the timestamp
        mood_entry.timestamp = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn update_mood(
        ctx: Context<UpdateMood>,
        _title: String,
        description: String,
    ) -> Result<()> {
        let mood = &mut ctx.accounts.mood;
        mood.description = description;

        Ok(())
    }

    pub fn delete_mood(_ctx: Context<DeleteMood>, _title: String) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateMood<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
      init,
      payer = signer,
      space = 8 + Mood::INIT_SPACE,
      seeds = [title.as_bytes(), signer.key().as_ref()],
      bump
    )]
    pub mood: Account<'info, Mood>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateMood<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(
    mut,
    realloc = 8 + Mood::INIT_SPACE,
    realloc::payer = signer,
    realloc::zero = true,
    seeds = [title.as_bytes(), signer.key().as_ref()],
    bump
    )]
    pub mood: Account<'info, Mood>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteMood<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [title.as_bytes(), signer.key().as_ref()],
        bump,
        close = signer
    )]
    pub mood_entry: Account<'info, Mood>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Mood {
    #[max_len(50)]
    pub title: String,
    #[max_len(50)]
    pub description: String,
    pub owner: Pubkey,
    pub timestamp: i64,
}
