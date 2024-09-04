use anchor_lang::{
    prelude::*,
    solana_program::program_pack::Pack
};
use anchor_spl::{
    token::{self, Token, TokenAccount, Transfer }
};
use spl_token::state::{Account as SplAccount};

pub mod account;
pub mod error;
pub mod constants;
pub mod utils;

use account::*;
use constants::*;
use error::*;
use utils::*;

declare_id!("2nzuuPMGzrwtzXXU6PXP3dcTj24gJKS6uG8AsCuSs2mf");

#[program]
pub mod staking_program {
    use super::*;
    pub fn initialize(
        ctx: Context<Initialize>,
        _global_bump: u8,
    ) -> ProgramResult {
        let global_authority = &mut ctx.accounts.global_authority;
        global_authority.super_admin = ctx.accounts.admin.key();
        Ok(())
    }

    pub fn initialize_barn(
        ctx: Context<InitializeBarn>
    ) -> ProgramResult {
        let mut user_barn = ctx.accounts.user_barn.load_init()?;
        user_barn.owner = ctx.accounts.owner.key();
        msg!("Owner: {:?}", user_barn.owner.to_string());
        Ok(())
    }

    #[access_control(user(&ctx.accounts.user_barn, &ctx.accounts.owner))]
    pub fn init_yarn_staking<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, InitYardStaking<'info>>, 
        _global_bump: u8,
        nft_count: u8,
        nft_mints: [Pubkey;7],
        nft_types: [u8;7],
    ) -> ProgramResult {
        if assert_nft_counts(nft_count.into(), 3, 7).is_err() {
            return Err(ProgramError::from(StakingError::InvalidNftsCount));
        }
        require!(ctx.remaining_accounts.len() == (nft_count * 2).into(), StakingError::InvalidTokenAccountPassing);

        let mut land_cnt: u64 = 0;
        let mut anim_cnt: u64 = 0;
        let mut farmer_cnt: u64 = 0;
        let mut idx = 0;
        for i in 0..nft_count {
            if nft_types[i as usize] == 0 {
                land_cnt += 1;
            } else if nft_types[i as usize] == 1 {
                anim_cnt += 1;
            } else if nft_types[i as usize] == 2 {
                farmer_cnt += 1;
            } else {
                return Err(ProgramError::from(StakingError::UnkownNftType));
            }

            let index = i as usize;
            let token_account_info = &ctx.remaining_accounts[idx as usize];
            if assert_owned_by(&token_account_info, &spl_token::id()).is_err() {
                return Err(ProgramError::from(StakingError::InvalidOwner));
            }

            let dest_token_account_info = &ctx.remaining_accounts[(idx + 1) as usize];
            if assert_owned_by(&dest_token_account_info, &spl_token::id()).is_err() {
                return Err(ProgramError::from(StakingError::InvalidOwner));
            }
            
            //     let token_account = TokenAccount::try_deserialize_unchecked(&mut &token_account_info.data.borrow_mut()[..]).unwrap();
            let token_account = SplAccount::unpack_from_slice(&token_account_info.data.borrow())?;
            require!(token_account.mint == nft_mints[index], StakingError::InvalidTokenAccountPassing);
            require!(token_account.amount == 1, StakingError::InvalidTokenAccountPassing);
            
            let dest_token_account = SplAccount::unpack_from_slice(&dest_token_account_info.data.borrow())?;
            require!(dest_token_account.mint == nft_mints[index], StakingError::InvalidTokenAccountPassing);
            idx += 2;
        }

        if assert_nft_counts(land_cnt, 1, 1).is_err() {
            return Err(ProgramError::from(StakingError::InvalidNftsCount));
        }
        if assert_nft_counts(anim_cnt, 1, 3).is_err() {
            return Err(ProgramError::from(StakingError::InvalidNftsCount));
        }
        if assert_nft_counts(farmer_cnt, 1, 3).is_err() {
            return Err(ProgramError::from(StakingError::InvalidNftsCount));
        }

        let mut user_barn = ctx.accounts.user_barn.load_mut()?;
        let token_program = &mut &ctx.accounts.token_program;
        let cnt = user_barn.yard_count as usize;
        idx = 0;
        for i in 0..nft_count {
            let index = i as usize;
            let token_account_info = &mut &ctx.remaining_accounts[idx as usize];
            let dest_token_account_info = &mut &ctx.remaining_accounts[(idx + 1) as usize];
            user_barn.add_nft(nft_mints[index], nft_types[index]);
            idx += 2;

            let cpi_accounts = Transfer {
                from: token_account_info.to_account_info().clone(),
                to: dest_token_account_info.to_account_info().clone(),
                authority: ctx.accounts.owner.to_account_info().clone()
            };
            token::transfer(
                CpiContext::new(token_program.clone().to_account_info(), cpi_accounts),
                1
            )?;
        }
        let timestamp = Clock::get()?.unix_timestamp;
        // msg!("Staked time: {:?}", timestamp);

        user_barn.yards[cnt].stake_time = timestamp;
        user_barn.yard_count += 1;

        ctx.accounts.global_authority.land_staked_cnt += land_cnt;
        ctx.accounts.global_authority.anim_staked_cnt += anim_cnt;
        ctx.accounts.global_authority.farmer_staked_cnt += farmer_cnt;

        msg!("{:?}", user_barn.staked_nft_count);
        Ok(())
        // Err(ProgramError::InvalidAccountData)
    }

    #[access_control(user(&ctx.accounts.user_barn, &ctx.accounts.owner))]
    pub fn withdraw_staked_yard<'a, 'b, 'c, 'info>(
        ctx: Context<'a, 'b, 'c, 'info, WithdrawStakedYard<'info>>, 
        global_bump: u8,
        nft_count: u8,
        nft_mints: [Pubkey;7],
        nft_types: [u8;7],
    ) -> ProgramResult {
        if assert_nft_counts(nft_count.into(), 3, 7).is_err() {
            return Err(ProgramError::from(StakingError::InvalidNftsCount));
        }
        require!(ctx.remaining_accounts.len() == (nft_count * 2).into(), StakingError::InvalidTokenAccountPassing);

        let mut land_cnt: u64 = 0;
        let mut anim_cnt: u64 = 0;
        let mut farmer_cnt: u64 = 0;
        let mut idx = 0;
        for i in 0..nft_count {
            if nft_types[i as usize] == 0 {
                land_cnt += 1;
            } else if nft_types[i as usize] == 1 {
                anim_cnt += 1;
            } else if nft_types[i as usize] == 2 {
                farmer_cnt += 1;
            } else {
                return Err(ProgramError::from(StakingError::UnkownNftType));
            }

            let index = i as usize;
            let token_account_info = &ctx.remaining_accounts[idx as usize];
            if assert_owned_by(&token_account_info, &spl_token::id()).is_err() {
                return Err(ProgramError::from(StakingError::InvalidOwner));
            }

            let dest_token_account_info = &ctx.remaining_accounts[(idx + 1) as usize];
            if assert_owned_by(&dest_token_account_info, &spl_token::id()).is_err() {
                return Err(ProgramError::from(StakingError::InvalidOwner));
            }
            
            let token_account = SplAccount::unpack_from_slice(&token_account_info.data.borrow())?;
            require!(token_account.mint == nft_mints[index], StakingError::InvalidTokenAccountPassing);
            
            let dest_token_account = SplAccount::unpack_from_slice(&dest_token_account_info.data.borrow())?;
            require!(dest_token_account.mint == nft_mints[index], StakingError::InvalidTokenAccountPassing);
            require!(dest_token_account.amount == 1, StakingError::InvalidTokenAccountPassing);
            idx += 2;
        }

        if assert_nft_counts(land_cnt, 1, 1).is_err() {
            return Err(ProgramError::from(StakingError::InvalidNftsCount));
        }
        if assert_nft_counts(anim_cnt, 1, 3).is_err() {
            return Err(ProgramError::from(StakingError::InvalidNftsCount));
        }
        if assert_nft_counts(farmer_cnt, 1, 3).is_err() {
            return Err(ProgramError::from(StakingError::InvalidNftsCount));
        }

        let mut user_barn = ctx.accounts.user_barn.load_mut()?;
        let timestamp = Clock::get()?.unix_timestamp;
        let reward = user_barn.remove_yard(nft_mints[0], nft_count, nft_mints, nft_types, timestamp).unwrap();
        
        msg!("{:?} rewards will be remain", reward);

        ctx.accounts.global_authority.land_staked_cnt -= land_cnt;
        ctx.accounts.global_authority.anim_staked_cnt -= anim_cnt;
        ctx.accounts.global_authority.farmer_staked_cnt -= farmer_cnt;

        let token_program = &mut &ctx.accounts.token_program;
        let seeds = &[GLOBAL_AUTHORITY_SEED.as_bytes(), &[global_bump]];
        let signer = &[&seeds[..]];

        idx = 0;
        for _i in 0..nft_count {
            let token_account_info = &mut &ctx.remaining_accounts[idx as usize];
            let dest_token_account_info = &mut &ctx.remaining_accounts[(idx + 1) as usize];
            idx += 2;
        
            let cpi_accounts = Transfer {
                from: dest_token_account_info.to_account_info().clone(),
                to: token_account_info.to_account_info().clone(),
                authority: ctx.accounts.global_authority.to_account_info()
            };
            token::transfer(
                CpiContext::new_with_signer(token_program.clone().to_account_info(), cpi_accounts, signer),
                1
            )?;
        }

        msg!("Withdraw {:?} nfts", user_barn.staked_nft_count);
        Ok(())
        // Err(ProgramError::InvalidAccountData)
    }

    #[access_control(user(&ctx.accounts.user_barn, &ctx.accounts.owner))]
    pub fn claim_reward(
        ctx: Context<ClaimReward>,
        global_bump: u8,
    ) -> ProgramResult {
        let timestamp = Clock::get()?.unix_timestamp;
    
        let mut user_barn = ctx.accounts.user_barn.load_mut()?;
        let reward: u64 = user_barn.claim_reward(
            timestamp
        )?;
        msg!("Reward: {:?}", reward);
        require!(reward > 0, StakingError::InvalidWithdrawTime);
        require!(ctx.accounts.reward_vault.amount >= reward, StakingError::InsufficientRewardVault);

        let seeds = &[GLOBAL_AUTHORITY_SEED.as_bytes(), &[global_bump]];
        let signer = &[&seeds[..]];
        let token_program = ctx.accounts.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: ctx.accounts.reward_vault.to_account_info(),
            to: ctx.accounts.user_reward_account.to_account_info(),
            authority: ctx.accounts.global_authority.to_account_info()
        };
        token::transfer(
            CpiContext::new_with_signer(token_program.clone(), cpi_accounts, signer),
            reward
        )?;

        // Err(ProgramError::InvalidAccountData)
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(global_bump: u8)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init_if_needed,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump = global_bump,
        payer = admin
    )]
    pub global_authority: Account<'info, GlobalBarn>,

    #[account(
        mut,
        constraint = reward_vault.mint == REWARD_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
        constraint = reward_vault.owner == global_authority.key(),
        constraint = reward_vault.amount >= MIN_REWARD_DEPOSIT_AMOUNT,
    )]
    pub reward_vault: Box<Account<'info, TokenAccount>>,

    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
pub struct InitializeBarn<'info> {
    #[account(zero)]
    pub user_barn: AccountLoader<'info, UserBarn>,

    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(
    global_bump: u8,
)]
pub struct InitYardStaking<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub user_barn: AccountLoader<'info, UserBarn>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump = global_bump,
    )]
    pub global_authority: Box<Account<'info, GlobalBarn>>,
    pub token_program: Program<'info, Token>,
    // pub associated_token_program: Program<'info, AssociatedToken>,
    // pub system_program: Program<'info, System>,
    // pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
#[instruction(
    global_bump: u8,
)]
pub struct WithdrawStakedYard<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub user_barn: AccountLoader<'info, UserBarn>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump = global_bump,
    )]
    pub global_authority: Box<Account<'info, GlobalBarn>>,
    pub token_program: Program<'info, Token>,
    // pub associated_token_program: Program<'info, AssociatedToken>,
    // pub system_program: Program<'info, System>,
    // pub rent: Sysvar<'info, Rent>
}

#[derive(Accounts)]
#[instruction(global_bump: u8)]
pub struct ClaimReward<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub user_barn: AccountLoader<'info, UserBarn>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED.as_ref()],
        bump = global_bump,
    )]
    pub global_authority: Account<'info, GlobalBarn>,

    #[account(
        mut,
        constraint = reward_vault.mint == REWARD_TOKEN_MINT_PUBKEY.parse::<Pubkey>().unwrap(),
        constraint = reward_vault.owner == global_authority.key(),
    )]
    pub reward_vault: Box<Account<'info, TokenAccount>>,

    #[account(
        mut,
        constraint = user_reward_account.owner == owner.key(),
    )]
    pub user_reward_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

// Access control modifiers
fn user(barn_loader: &AccountLoader<UserBarn>, user: &AccountInfo) -> Result<()> {
    let user_barn = barn_loader.load()?;
    require!(user_barn.owner == *user.key, StakingError::InvalidUserBarn);
    Ok(())
}