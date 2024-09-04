export type StakingProgram = {
  "version": "0.1.0",
  "name": "staking_program",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "barnWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "globalBump",
          "type": "u8"
        },
        {
          "name": "barnWalletBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeBarn",
      "accounts": [
        {
          "name": "userBarn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "GlobalBarn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fixedNftCount",
            "type": "u64"
          },
          {
            "name": "landNftCount",
            "type": "u64"
          },
          {
            "name": "animNftCount",
            "type": "u64"
          },
          {
            "name": "farmerNftCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UserBarn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "itemCount",
            "type": "u64"
          },
          {
            "name": "items",
            "type": {
              "array": [
                {
                  "defined": "StakedYard"
                },
                1000
              ]
            }
          },
          {
            "name": "rewardTime",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "StakedYard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "landMint",
            "type": "publicKey"
          },
          {
            "name": "animCnt",
            "type": "i64"
          },
          {
            "name": "animMints",
            "type": {
              "array": [
                "publicKey",
                5
              ]
            }
          },
          {
            "name": "farmerCnt",
            "type": "i64"
          },
          {
            "name": "farmerMints",
            "type": {
              "array": [
                "publicKey",
                5
              ]
            }
          },
          {
            "name": "stakeTime",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidUserBarn",
      "msg": "Invalid User Barn"
    },
    {
      "code": 6001,
      "name": "InvalidBarnError",
      "msg": "Invalid barn number"
    },
    {
      "code": 6002,
      "name": "InvalidNFTAddress",
      "msg": "No Matching NFT to withdraw"
    },
    {
      "code": 6003,
      "name": "InvalidOwner",
      "msg": "NFT Owner key mismatch"
    },
    {
      "code": 6004,
      "name": "InvalidWithdrawTime",
      "msg": "Staking Locked Now"
    },
    {
      "code": 6005,
      "name": "IndexOverflow",
      "msg": "Withdraw NFT Index OverFlow"
    }
  ],
  "metadata": {
    "address": "9rEUmnkS5ZTNNDp394DSCcrJ2PNq7e8mvVNVBNAQEjDc"
  }
};

export const IDL: StakingProgram = {
  "version": "0.1.0",
  "name": "staking_program",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "admin",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "globalAuthority",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "barnWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "rent",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "globalBump",
          "type": "u8"
        },
        {
          "name": "barnWalletBump",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeBarn",
      "accounts": [
        {
          "name": "userBarn",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "GlobalBarn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fixedNftCount",
            "type": "u64"
          },
          {
            "name": "landNftCount",
            "type": "u64"
          },
          {
            "name": "animNftCount",
            "type": "u64"
          },
          {
            "name": "farmerNftCount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "UserBarn",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "itemCount",
            "type": "u64"
          },
          {
            "name": "items",
            "type": {
              "array": [
                {
                  "defined": "StakedYard"
                },
                1000
              ]
            }
          },
          {
            "name": "rewardTime",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "StakedYard",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "landMint",
            "type": "publicKey"
          },
          {
            "name": "animCnt",
            "type": "i64"
          },
          {
            "name": "animMints",
            "type": {
              "array": [
                "publicKey",
                5
              ]
            }
          },
          {
            "name": "farmerCnt",
            "type": "i64"
          },
          {
            "name": "farmerMints",
            "type": {
              "array": [
                "publicKey",
                5
              ]
            }
          },
          {
            "name": "stakeTime",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidUserBarn",
      "msg": "Invalid User Barn"
    },
    {
      "code": 6001,
      "name": "InvalidBarnError",
      "msg": "Invalid barn number"
    },
    {
      "code": 6002,
      "name": "InvalidNFTAddress",
      "msg": "No Matching NFT to withdraw"
    },
    {
      "code": 6003,
      "name": "InvalidOwner",
      "msg": "NFT Owner key mismatch"
    },
    {
      "code": 6004,
      "name": "InvalidWithdrawTime",
      "msg": "Staking Locked Now"
    },
    {
      "code": 6005,
      "name": "IndexOverflow",
      "msg": "Withdraw NFT Index OverFlow"
    }
  ],
  "metadata": {
    "address": "9rEUmnkS5ZTNNDp394DSCcrJ2PNq7e8mvVNVBNAQEjDc"
  }
};
