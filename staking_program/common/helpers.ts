
import { Program, web3 } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import {
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction
} from '@solana/web3.js';
import { Token, TOKEN_PROGRAM_ID, AccountLayout, MintLayout } from "@solana/spl-token";
// import * as borsh from 'borsh';
// import bs58 from 'bs58';
// import BN from 'bn.js';
import fs from 'fs';
import path from 'path';
import { GlobalBarn, UserBarn } from './types';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';

// Configure the local cluster.
// const provider = anchor.Provider.env();
// anchor.setProvider(provider);

anchor.setProvider(anchor.Provider.local(web3.clusterApiUrl('mainnet-beta')));
const solConnection = anchor.getProvider().connection;
const payer = anchor.getProvider().wallet;
const ASSOCIATED_TOKEN_PROGRAM_ID: PublicKey = new PublicKey(
  'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
);
const ADMIN_PUBKEY = new PublicKey("Fs8R7R6dP3B7mAJ6QmWZbomBRuTbiJyiR4QYjoxhLdPu");
const REWARD_TOKEN_MINT = new PublicKey("765R1rpPGVZKKJZPevTp5b2dTAHJZNX4feTiHDEqj7JV");
const PROGRAM_ID = "2nzuuPMGzrwtzXXU6PXP3dcTj24gJKS6uG8AsCuSs2mf";
const GLOBAL_AUTHORITY_SEED = "global-authority";
const USER_BARN_SIZE = 8 + 18_864;
let rewardVault: PublicKey = null;
let program: Program = null;

// GlobalAuthority:  BrCdNZf1sSMVon6iJwLBPt5Vizjt5nWgGEqJSsv4JQc5
// RewardVault:  EMQAfFHMCC7xJL4v9xh3AEDZDGjyw5LsnEjPkJ422wEF
const main = async () => {
  // Configure the client to use the local cluster.
  // const walletKeypair = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(path.resolve("/home/fury/.config/solana/id.json"), 'utf-8'))), { skipValidation: true });

  const idl = JSON.parse(
    fs.readFileSync(__dirname + "/staking_program.json", "utf8")
  );

  // Address of the deployed program.
  const programId = new anchor.web3.PublicKey(PROGRAM_ID);

  // Generate the program client from IDL.
  program = new anchor.Program(idl, programId);
  console.log('ProgramId: ', program.programId.toBase58());

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  console.log('GlobalAuthority: ', globalAuthority.toBase58());

  rewardVault = await getAssociatedTokenAccount(globalAuthority, REWARD_TOKEN_MINT);
  console.log('RewardVault: ', rewardVault.toBase58());

  // await initProject();

  const globalState: GlobalBarn = await getGlobalState();
  console.log(
    globalState.superAdmin.toBase58(),
    globalState.landStakedCnt.toNumber(),
    globalState.animStakedCnt.toNumber(),
    globalState.farmerStakedCnt.toNumber(),
  );

  // await initUserBarn(payer.publicKey);

  // await stakeYard(
  //   payer.publicKey,
  //   "BLLMACpAgi51SFweG4FWLsD1XMCVJaSwKYJ4jQmHUekw",
  //   "EQERYmH23T76gaJsWhrLntvPFU5YJMUKaDyy51m51Tb2",
  //   "GcZotb4M4bXBZZK6jhckWrPDJmjbA14CBW2ayvCu8zue",
  // );

  // await withdrawYard(
  //   payer.publicKey,
  //   "BLLMACpAgi51SFweG4FWLsD1XMCVJaSwKYJ4jQmHUekw",
  //   "EQERYmH23T76gaJsWhrLntvPFU5YJMUKaDyy51m51Tb2",
  //   "GcZotb4M4bXBZZK6jhckWrPDJmjbA14CBW2ayvCu8zue",
  // );

  const userBarnState: UserBarn = await getUserBarnState(new PublicKey('35dousRVhW6cLLDmxMDBE36gq1YTXDVDGbcfhMdjrSbE'));
  console.log(userBarnState.owner.toBase58());
  console.log(userBarnState.stakedNftCount.toNumber());
  console.log(userBarnState.yardCount.toNumber());
  console.log(userBarnState.yards[0]);
  console.log(userBarnState.rewardTime.toNumber());
  console.log(userBarnState.allNftsStakedLastYard);

  // await claimReward(payer.publicKey);
};

export const initProject = async (
) => {
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  const tx = await program.rpc.initialize(bump, {
    accounts: {
      admin: payer.publicKey,
      globalAuthority,
      rewardVault,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    },
    signers: [],
  });
  await solConnection.confirmTransaction(tx, "confirmed");

  // showToast("Success. txHash=" + tx, 0);
  console.log("txHash =", tx);
  return false;
}

export const initUserBarn = async (userAddress: PublicKey) => {
  let userBarnKey = await PublicKey.createWithSeed(
    userAddress,
    "user-barn",
    program.programId,
  );
  console.log("user barn size: ", USER_BARN_SIZE);
  let ix = SystemProgram.createAccountWithSeed({
    fromPubkey: userAddress,
    basePubkey: userAddress,
    seed: "user-barn",
    newAccountPubkey: userBarnKey,
    lamports: await solConnection.getMinimumBalanceForRentExemption(USER_BARN_SIZE),
    space: USER_BARN_SIZE,
    programId: program.programId,
  });
  console.log("userBarn.pubk =", userBarnKey.toBase58())
  const tx = await program.rpc.initializeBarn(
    {
      accounts: {
        userBarn: userBarnKey,
        owner: userAddress
      },
      instructions: [
        ix
      ],
      signers: []
    }
  );
}

export const getUserBarnState = async (
  userAddress: PublicKey
): Promise<UserBarn | null> => {
  if (!userAddress) return null;
  // let cloneWindow: any = window;
  // let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  // const program = new anchor.Program(IDL, PROGRAM_ID, provider);

  let userBarnKey = await PublicKey.createWithSeed(
    userAddress,
    "user-barn",
    program.programId,
  );
  console.log('User Barn: ', userBarnKey.toBase58());
  try {
    let barnState = await program.account.userBarn.fetch(userBarnKey);
    return barnState as UserBarn;
  } catch {
    return null;
  }
}

export const getGlobalState = async (
): Promise<GlobalBarn | null> => {
  // let cloneWindow: any = window;
  // let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  try {
    let globalState = await program.account.globalBarn.fetch(globalAuthority);
    return globalState as GlobalBarn;
  } catch {
    return null;
  }
}

export const stakeYard = async (
  // wallet: WalletContextState,
  userAddress: PublicKey,
  land_mint: string,
  anim_mint: string,
  farmer_mint: string,
) => {
  // if (!wallet.publicKey || mint === "") return;

  const land_nft_mint = new PublicKey(land_mint);
  const anim_nft_mint = new PublicKey(anim_mint);
  const farmer_nft_mint = new PublicKey(farmer_mint);

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  let userBarnKey = await PublicKey.createWithSeed(
    userAddress,
    "user-barn",
    program.programId,
  );

  let tx = new Transaction({
    recentBlockhash: await (await solConnection.getRecentBlockhash()).blockhash,
    feePayer: payer.publicKey,
  });

  let barnAccount = await solConnection.getAccountInfo(userBarnKey);
  if (barnAccount === null || barnAccount.data === null) {
    tx.add(SystemProgram.createAccountWithSeed({
      fromPubkey: userAddress,
      basePubkey: userAddress,
      seed: "user-barn",
      newAccountPubkey: userBarnKey,
      lamports: await solConnection.getMinimumBalanceForRentExemption(USER_BARN_SIZE),
      space: USER_BARN_SIZE,
      programId: program.programId,
    }));
    tx.add(program.instruction.initializeBarn(
      {
        accounts: {
          userBarn: userBarnKey,
          owner: userAddress,
        }
      }
    ))
  }

  let userLandTokenAccount = await getAssociatedTokenAccount(userAddress, land_nft_mint);
  let userAnimTokenAccount = await getAssociatedTokenAccount(userAddress, anim_nft_mint);
  let userFarmerTokenAccount = await getAssociatedTokenAccount(userAddress, farmer_nft_mint);

  let remainingAccounts = [];
  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    solConnection,
    payer.publicKey,
    globalAuthority,
    [
      land_nft_mint,
      anim_nft_mint,
      farmer_nft_mint,
    ]
  );

  if (instructions.length > 0) {
    tx.add(...instructions);
    payer.signTransaction(tx);
    let txHash = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
    await solConnection.confirmTransaction(txHash, "confirmed");
    // showToast("Success. txHash=" + txHash, 0);
    console.log("txHash =", txHash);
  }

  let idx = 0, nft_mints: anchor.web3.PublicKey[] = [], nft_types: number[] = [];
  for (let i = 0; i < 7; i++) {
    nft_mints.push(SystemProgram.programId);
    nft_types.push(0);    // land_nft
  }

  nft_mints[idx] = new PublicKey(land_mint);
  nft_types[idx] = 0;     // land_nft
  remainingAccounts.push({
    pubkey: userLandTokenAccount,
    isWritable: true,
    isSigner: false,
  });
  remainingAccounts.push({
    pubkey: destinationAccounts[idx++],
    isWritable: true,
    isSigner: false,
  });

  nft_mints[idx] = new PublicKey(anim_mint);
  nft_types[idx] = 1;     // anim_nft
  remainingAccounts.push({
    pubkey: userAnimTokenAccount,
    isWritable: true,
    isSigner: false,
  });
  remainingAccounts.push({
    pubkey: destinationAccounts[idx++],
    isWritable: true,
    isSigner: false,
  });

  nft_mints[idx] = new PublicKey(farmer_mint);
  nft_types[idx] = 2;     // farmer_nft
  remainingAccounts.push({
    pubkey: userFarmerTokenAccount,
    isWritable: true,
    isSigner: false,
  });
  remainingAccounts.push({
    pubkey: destinationAccounts[idx++],
    isWritable: true,
    isSigner: false,
  });

  tx = new Transaction({
    recentBlockhash: await (await solConnection.getRecentBlockhash()).blockhash,
    feePayer: payer.publicKey,
  });
  tx.add(program.instruction.initYarnStaking(
    bump, 3, nft_mints, nft_types, {
    accounts: {
      owner: userAddress,
      userBarn: userBarnKey,
      globalAuthority,
      tokenProgram: TOKEN_PROGRAM_ID,
      // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      // systemProgram: SystemProgram.programId,
      // rent: SYSVAR_RENT_PUBKEY
    },
    remainingAccounts,
  }
  ));
  payer.signTransaction(tx);
  let txHash = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
  await solConnection.confirmTransaction(txHash, "confirmed");
  // showToast("Success. txHash=" + txHash, 0);
  console.log("txHash =", txHash);
  return false;
}

export const withdrawYard = async (
  // wallet: WalletContextState,
  userAddress: PublicKey,
  land_mint: string,
  anim_mint: string,
  farmer_mint: string,
) => {
  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );
  const land_nft_mint = new PublicKey(land_mint);
  const anim_nft_mint = new PublicKey(anim_mint);
  const farmer_nft_mint = new PublicKey(farmer_mint);

  let userBarnKey = await PublicKey.createWithSeed(
    userAddress,
    "user-barn",
    program.programId,
  );

  let userLandTokenAccount = await getAssociatedTokenAccount(userAddress, land_nft_mint);
  let userAnimTokenAccount = await getAssociatedTokenAccount(userAddress, anim_nft_mint);
  let userFarmerTokenAccount = await getAssociatedTokenAccount(userAddress, farmer_nft_mint);

  let remainingAccounts = [];
  let { instructions, destinationAccounts } = await getATokenAccountsNeedCreate(
    solConnection,
    payer.publicKey,
    globalAuthority,
    [
      land_nft_mint,
      anim_nft_mint,
      farmer_nft_mint,
    ]
  );

  let idx = 0, nft_mints: anchor.web3.PublicKey[] = [], nft_types: number[] = [];
  for (let i = 0; i < 7; i++) {
    nft_mints.push(SystemProgram.programId);
    nft_types.push(0);    // land_nft
  }

  nft_mints[idx] = new PublicKey(land_mint);
  nft_types[idx] = 0;     // land_nft
  remainingAccounts.push({
    pubkey: userLandTokenAccount,
    isWritable: true,
    isSigner: false,
  });
  remainingAccounts.push({
    pubkey: destinationAccounts[idx++],
    isWritable: true,
    isSigner: false,
  });

  nft_mints[idx] = new PublicKey(anim_mint);
  nft_types[idx] = 1;     // anim_nft
  remainingAccounts.push({
    pubkey: userAnimTokenAccount,
    isWritable: true,
    isSigner: false,
  });
  remainingAccounts.push({
    pubkey: destinationAccounts[idx++],
    isWritable: true,
    isSigner: false,
  });

  nft_mints[idx] = new PublicKey(farmer_mint);
  nft_types[idx] = 2;     // farmer_nft
  remainingAccounts.push({
    pubkey: userFarmerTokenAccount,
    isWritable: true,
    isSigner: false,
  });
  remainingAccounts.push({
    pubkey: destinationAccounts[idx++],
    isWritable: true,
    isSigner: false,
  });

  let tx = new Transaction({
    recentBlockhash: await (await solConnection.getRecentBlockhash()).blockhash,
    feePayer: payer.publicKey,
  });
  tx.add(program.instruction.withdrawStakedYard(
    bump, 3, nft_mints, nft_types, {
    accounts: {
      owner: userAddress,
      userBarn: userBarnKey,
      globalAuthority,
      tokenProgram: TOKEN_PROGRAM_ID,
      // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      // systemProgram: SystemProgram.programId,
      // rent: SYSVAR_RENT_PUBKEY
    },
    remainingAccounts,
  }
  ));
  payer.signTransaction(tx);
  let txHash = await solConnection.sendTransaction(tx, [(payer as NodeWallet).payer]);
  await solConnection.confirmTransaction(txHash, "confirmed");
  // showToast("Success. txHash=" + txHash, 0);
  console.log("txHash =", txHash);
  return false;
}

export const claimReward = async (
  // wallet: WalletContextState
  userAddress: PublicKey,
) => {
  // if (!wallet.publicKey) return;
  // let cloneWindow: any = window;
  // let provider = new anchor.Provider(solConnection, cloneWindow['solana'], anchor.Provider.defaultOptions())
  // const program = new anchor.Program(IDL, PROGRAM_ID, provider);

  const [globalAuthority, bump] = await PublicKey.findProgramAddress(
    [Buffer.from(GLOBAL_AUTHORITY_SEED)],
    program.programId
  );

  let userBarnKey = await PublicKey.createWithSeed(
    userAddress,
    "user-barn",
    program.programId,
  );

  let userRewardAccount = await getAssociatedTokenAccount(userAddress, REWARD_TOKEN_MINT);
  console.log('userRewardAccount: ', userRewardAccount.toBase58());

  let txHash = await program.rpc.claimReward(
    bump, {
    accounts: {
      owner: userAddress,
      userBarn: userBarnKey,
      globalAuthority,
      rewardVault,
      userRewardAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    }
  }
  );
  await solConnection.confirmTransaction(txHash, "confirmed");
  // showToast("Success. txHash=" + txHash, 0);
  console.log("txHash =", txHash);
  return false;
}

const getOwnerOfNFT = async (nftMintPk: PublicKey): Promise<PublicKey> => {
  let tokenAccountPK = await getNFTTokenAccount(nftMintPk);
  let tokenAccountInfo = await solConnection.getAccountInfo(tokenAccountPK);

  console.log("nftMintPk=", nftMintPk.toBase58());
  console.log("tokenAccountInfo =", tokenAccountInfo);

  if (tokenAccountInfo && tokenAccountInfo.data) {
    let ownerPubkey = new PublicKey(tokenAccountInfo.data.slice(32, 64))
    console.log("ownerPubkey=", ownerPubkey.toBase58());
    return ownerPubkey;
  }
  return new PublicKey("");
}

const getTokenAccount = async (mintPk: PublicKey, userPk: PublicKey): Promise<PublicKey> => {
  let tokenAccount = await solConnection.getProgramAccounts(
    TOKEN_PROGRAM_ID,
    {
      filters: [
        {
          dataSize: 165
        },
        {
          memcmp: {
            offset: 0,
            bytes: mintPk.toBase58()
          }
        },
        {
          memcmp: {
            offset: 32,
            bytes: userPk.toBase58()
          }
        },
      ]
    }
  );
  return tokenAccount[0].pubkey;
}

const getNFTTokenAccount = async (nftMintPk: PublicKey): Promise<PublicKey> => {
  console.log("getNFTTokenAccount nftMintPk=", nftMintPk.toBase58());
  let tokenAccount = await solConnection.getProgramAccounts(
    TOKEN_PROGRAM_ID,
    {
      filters: [
        {
          dataSize: 165
        },
        {
          memcmp: {
            offset: 64,
            bytes: '2'
          }
        },
        {
          memcmp: {
            offset: 0,
            bytes: nftMintPk.toBase58()
          }
        },
      ]
    }
  );
  return tokenAccount[0].pubkey;
}


const getAssociatedTokenAccount = async (ownerPubkey: PublicKey, mintPk: PublicKey): Promise<PublicKey> => {
  let associatedTokenAccountPubkey = (await PublicKey.findProgramAddress(
    [
      ownerPubkey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      mintPk.toBuffer(), // mint address
    ],
    ASSOCIATED_TOKEN_PROGRAM_ID
  ))[0];
  return associatedTokenAccountPubkey;
}

export const createAssociatedTokenAccountInstruction = (
  associatedTokenAddress: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey,
  walletAddress: anchor.web3.PublicKey,
  splTokenMintAddress: anchor.web3.PublicKey
) => {
  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: associatedTokenAddress, isSigner: false, isWritable: true },
    { pubkey: walletAddress, isSigner: false, isWritable: false },
    { pubkey: splTokenMintAddress, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    {
      pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];
  return new anchor.web3.TransactionInstruction({
    keys,
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    data: Buffer.from([]),
  });
}

export const getATokenAccountsNeedCreate = async (
  connection: anchor.web3.Connection,
  walletAddress: anchor.web3.PublicKey,
  owner: anchor.web3.PublicKey,
  nfts: anchor.web3.PublicKey[],
) => {
  let instructions = [], destinationAccounts = [];
  for (const mint of nfts) {
    const destinationPubkey = await getAssociatedTokenAccount(owner, mint);
    const response = await connection.getAccountInfo(destinationPubkey);
    if (!response) {
      const createATAIx = createAssociatedTokenAccountInstruction(
        destinationPubkey,
        walletAddress,
        owner,
        mint,
      );
      instructions.push(createATAIx);
    }
    destinationAccounts.push(destinationPubkey);
  }
  return {
    instructions,
    destinationAccounts,
  };
}

main();