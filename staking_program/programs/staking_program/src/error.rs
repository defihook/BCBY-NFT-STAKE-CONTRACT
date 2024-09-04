use anchor_lang::prelude::*;

#[error]
pub enum StakingError {
    #[msg("Uninitialized account")]
    Uninitialized,
    #[msg("Invalid User Barn")]
    InvalidUserBarn,
    #[msg("Invalid barn number")]
    InvalidBarnError,
    #[msg("No Matching NFT to withdraw")]
    InvalidNFTAddress,
    #[msg("Unkown Nft type is supplied")]
    UnkownNftType,
    #[msg("NFT Owner key mismatch")]
    InvalidOwner,
    #[msg("Staking Locked Now")]
    InvalidWithdrawTime,
    #[msg("Withdraw NFT Index OverFlow")]
    IndexOverflow,
    #[msg("All NFTs already staked for last yard")]
    AllNFTsAlreadyStaked,
    #[msg("No yard is created for staking NFTs")]
    NoYardCreatedYet,
    #[msg("Max yard count is over for staking NFTs")]
    OverMaxYardStaking,
    #[msg("All Animal NFTs already staked for last yard")]
    OverMaxAnimalNFTStaking,
    #[msg("All Farmer NFTs already staked for last yard")]
    OverMaxFarmerNFTStaking,
    #[msg("Insufficient Reward token balance")]
    InsufficientRewardVault,
    #[msg("Cpi spl token transfer failed")]
    TokenTransferFailed,
    #[msg("Nfts count should be between 3 to 11")]
    InvalidNftsCount,
    #[msg("Passed token account is mismatching with NFT mints")]
    InvalidTokenAccountPassing,
    #[msg("Min staking time for unstake is 1 week")]
    NotEnoughLockingTime,
}