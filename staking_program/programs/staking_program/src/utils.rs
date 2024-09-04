use {
    crate::StakingError,
    anchor_lang::{
        prelude::{AccountInfo, ProgramError, ProgramResult, Pubkey},
        solana_program::{
            program_pack::{IsInitialized, Pack},
        },
    },
};

pub fn assert_initialized<T: Pack + IsInitialized>(
    account_info: &AccountInfo,
) -> Result<T, ProgramError> {
    let account: T = T::unpack_unchecked(&account_info.data.borrow())?;
    if !account.is_initialized() {
        Err(ProgramError::from(StakingError::Uninitialized))
    } else {
        Ok(account)
    }
}

pub fn assert_owned_by(account: &AccountInfo, owner: &Pubkey) -> ProgramResult {
    if account.owner != owner {
        Err(ProgramError::from(StakingError::InvalidOwner))
    } else {
        Ok(())
    }
}

pub fn assert_nft_counts(count: u64, min: u64, max: u64) -> ProgramResult {
    if (count < min || count > max) {
        Err(ProgramError::from(StakingError::InvalidNftsCount))
    } else {
        Ok(())
    }
}

///TokenTransferParams
pub struct TokenTransferParams<'a: 'b, 'b> {
    /// source
    pub source: AccountInfo<'a>,
    /// destination
    pub destination: AccountInfo<'a>,
    /// amount
    pub amount: u64,
    /// authority
    pub authority: AccountInfo<'a>,
    /// authority_signer_seeds
    pub authority_signer_seeds: &'b [&'b [u8]],
    /// token_program
    pub token_program: AccountInfo<'a>,
}