use anchor_lang::prelude::*;

use crate::constants::*;
use crate::error::*;

#[account]
#[derive(Default)]
pub struct GlobalBarn {
    pub super_admin: Pubkey,    // 32
    pub land_staked_cnt: u64,   // 8
    pub anim_staked_cnt: u64,   // 8
    pub farmer_staked_cnt: u64, // 8
}

#[zero_copy]
#[derive(Default, PartialEq)]
pub struct StakedYard {
    // 376
    // yard can be identified uniquely by the land mint
    pub land_mint: Pubkey,         // 32
    pub anim_cnt: u64,             // 8
    pub anim_mints: [Pubkey; 5],   // 32 * 5 = 160
    pub farmer_cnt: u64,           // 8
    pub farmer_mints: [Pubkey; 5], // 32 * 5 = 160
    pub stake_time: i64,           // 8
}

#[account(zero_copy)]
pub struct UserBarn {
    // 8 + 18_864
    pub owner: Pubkey,                        // 32
    pub staked_nft_count: u64,                // 8
    pub yard_count: u64,                      // 8
    pub yards: [StakedYard; STAKE_MAX_COUNT], // 376 * 50 = 18_800
    pub reward_time: i64,                     // 8
    pub remain_reward_amount: u64,            // 8
}

impl Default for UserBarn {
    #[inline]
    fn default() -> UserBarn {
        UserBarn {
            owner: Pubkey::default(),
            staked_nft_count: 0,
            yard_count: 0,
            yards: [StakedYard {
                ..Default::default()
            }; STAKE_MAX_COUNT],
            remain_reward_amount: 0,
            reward_time: 0,
        }
    }
}

impl UserBarn {
    pub fn add_nft(&mut self, nft_pubkey: Pubkey, nft_type: u8) {
        let idx = self.yard_count as usize;
        if nft_type == 0 {
            self.yards[idx].land_mint = nft_pubkey;
            self.yards[idx].anim_cnt = 0;
            self.yards[idx].farmer_cnt = 0;
        } else if nft_type == 1 {
            let cnt = self.yards[idx].anim_cnt as usize;
            self.yards[idx].anim_mints[cnt] = nft_pubkey;
            self.yards[idx].anim_cnt += 1;
        } else {
            let cnt = self.yards[idx].farmer_cnt as usize;
            self.yards[idx].farmer_mints[cnt] = nft_pubkey;
            self.yards[idx].farmer_cnt += 1;
        }
        self.staked_nft_count += 1;
    }

    pub fn remove_yard(
        &mut self,
        land_nft_mint: Pubkey,
        nft_count: u8,
        nft_mints: [Pubkey; 7],
        nft_types: [u8; 7],
        now: i64,
    ) -> Result<u64> {
        let mut withdrawn: u8 = 0;
        let mut reward: u64 = 0;
        let mut index: usize = 0;
        for i in 0..self.yard_count {
            let idx = i as usize;
            if self.yards[idx].land_mint.eq(&land_nft_mint) {
                index = idx;
                withdrawn = 1;
                break;
            }
        }
        require!(withdrawn == 1, StakingError::InvalidNFTAddress);

        for i in 1..nft_count {
            let idx = i as usize;
            withdrawn = 0;
            if nft_types[idx] == 1 {
                for j in 0..self.yards[index].anim_cnt {
                    if self.yards[index].anim_mints[j as usize].eq(&nft_mints[idx]) {
                        withdrawn = 1;
                        break;
                    }
                }
            } else {
                for j in 0..self.yards[index].farmer_cnt {
                    if self.yards[index].farmer_mints[j as usize].eq(&nft_mints[idx]) {
                        withdrawn = 1;
                        break;
                    }
                }
            }
            require!(withdrawn == 1, StakingError::InvalidNFTAddress);
        }

        require!(
            now >= self.yards[index].stake_time + LOCK_TIME,
            StakingError::NotEnoughLockingTime
        );

        let last_idx: usize = (self.yard_count - 1) as usize;
        if index != last_idx {
            self.yards[index] = self.yards[last_idx];
        }

        self.staked_nft_count -= nft_count as u64;
        self.yard_count -= 1;

        let mut last_reward_time = self.reward_time;
        if last_reward_time < self.yards[index].stake_time {
            last_reward_time = self.yards[index].stake_time;
        }
        let mut count: u64 = 1;
        if nft_count == 3 {
            count = 5;
        } else if nft_count == 4 {
            count = 6;
        } else if nft_count == 5 {
            count = 8;
        } else if nft_count == 6 {
            count = 10;
        } else if nft_count == 7 {
            count = 14;
        }
        reward = (((now - last_reward_time) / EPOCH) as u64) * REWARD_PER_EPOCH * count;
        self.remain_reward_amount += reward;
        Ok(reward)
    }

    pub fn claim_reward(&mut self, now: i64) -> Result<u64> {
        let mut total_reward: u64 = 0;
        msg!("Now: {:?} Last_Reward_Time: {}", now, self.reward_time);
        for i in 0..self.yard_count {
            let index = i as usize;
            let mut last_reward_time = self.reward_time;
            if last_reward_time < self.yards[index].stake_time {
                last_reward_time = self.yards[index].stake_time;
            }
            let mut count = 1;
            count += self.yards[index].anim_cnt + self.yards[index].farmer_cnt;
            if count == 3 {
                count = 5;
            } else if count == 4 {
                count = 6;
            } else if count == 5 {
                count = 8;
            } else if count == 6 {
                count = 10;
            } else if count == 7 {
                count = 14;
            }
            let reward = (((now - last_reward_time) / EPOCH) as u64) * REWARD_PER_EPOCH * count;
            total_reward += reward;
        }
        total_reward += self.remain_reward_amount;
        self.reward_time = now;
        self.remain_reward_amount = 0;
        Ok(total_reward)
    }
}
