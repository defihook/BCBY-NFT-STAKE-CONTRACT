import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { StakingProgram } from '../target/types/staking_program';
import { SystemProgram, SYSVAR_RENT_PUBKEY, Transaction } from "@solana/web3.js";

import { Token, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

const PublicKey = anchor.web3.PublicKey;

const GLOBAL_AUTHORITY_SEED = "global-authority";

describe('staking_program', () => {

  // Configure the client to use the local cluster.
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);
  
  const program = anchor.workspace.StakingProgram as Program<StakingProgram>;
  const superOwner = anchor.web3.Keypair.generate();
  const user = anchor.web3.Keypair.generate();

  const USER_BARN_SIZE = 8 + 18_864;

  let reward_token_mint = null;
  let rewardVault = null;
  let userRewardTokenAccount = null;
  let nft_token_mint = null;
  let userTokenAccount = null;
  let anim_nft_token_mint = null;
  let userAnimTokenAccount = null;
  let anim_nft_token_mint1 = null;
  let userAnimTokenAccount1 = null;
  let anim_nft_token_mint2 = null;
  let userAnimTokenAccount2 = null;
  let anim_nft_token_mint3 = null;
  let userAnimTokenAccount3 = null;
  let anim_nft_token_mint4 = null;
  let userAnimTokenAccount4 = null;
  let farmer_nft_token_mint = null;
  let userFarmerTokenAccount = null;
  let farmer_nft_token_mint1 = null;
  let userFarmerTokenAccount1 = null;
  let farmer_nft_token_mint2 = null;
  let userFarmerTokenAccount2 = null;
  let farmer_nft_token_mint3 = null;
  let userFarmerTokenAccount3 = null;
  let farmer_nft_token_mint4 = null;
  let userFarmerTokenAccount4 = null;

  it('Is initialized!', async () => {
    // Add your test here.
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(superOwner.publicKey, 1000000000),
      "confirmed"
    );
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(user.publicKey, 1000000000),
      "confirmed"
    );
    
    console.log("super owner =", superOwner.publicKey.toBase58());
    console.log("user =", user.publicKey.toBase58());

    //this is the xstep token
    //test xstep token hardcoded in program, mint authority is itself
    // let rawdata = fs.readFileSync('tests/keys/reward_mint.json');
    // let keyData = JSON.parse(rawdata.toString());
    // let rewardMintKey = anchor.web3.Keypair.fromSecretKey(new Uint8Array(keyData));
    // let rewardMintPubkey = rewardMintKey.publicKey;
    // console.log(`reward mint = ${rewardMintPubkey.toBase58()}`);

    // Mint one Land NFT for user
    nft_token_mint = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userTokenAccount = await nft_token_mint.createAccount(user.publicKey);
    await nft_token_mint.mintTo(
      userTokenAccount,
      superOwner,
      [],
      1
    );
    console.log("land NFT = ", nft_token_mint.publicKey.toBase58(), userTokenAccount.toBase58());

    // Mint Animal NFT for user
    anim_nft_token_mint = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userAnimTokenAccount = await anim_nft_token_mint.createAccount(user.publicKey);
    
    await anim_nft_token_mint.mintTo(
      userAnimTokenAccount,
      superOwner,
      [],
      1
    );  
    console.log("anim NFT = ", anim_nft_token_mint.publicKey.toBase58(), userAnimTokenAccount.toBase58());

    // Mint Animal NFT for user
    anim_nft_token_mint1 = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userAnimTokenAccount1 = await anim_nft_token_mint1.createAccount(user.publicKey);
    
    await anim_nft_token_mint1.mintTo(
      userAnimTokenAccount1,
      superOwner,
      [],
      1
    );

    // Mint Animal NFT for user
    anim_nft_token_mint2 = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userAnimTokenAccount2 = await anim_nft_token_mint2.createAccount(user.publicKey);
    
    await anim_nft_token_mint2.mintTo(
      userAnimTokenAccount2,
      superOwner,
      [],
      1
    );  

    // Mint Animal NFT for user
    anim_nft_token_mint3 = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userAnimTokenAccount3 = await anim_nft_token_mint3.createAccount(user.publicKey);
    
    await anim_nft_token_mint3.mintTo(
      userAnimTokenAccount3,
      superOwner,
      [],
      1
    );  

    // Mint Animal NFT for user
    anim_nft_token_mint4 = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userAnimTokenAccount4 = await anim_nft_token_mint4.createAccount(user.publicKey);
    
    await anim_nft_token_mint4.mintTo(
      userAnimTokenAccount4,
      superOwner,
      [],
      1
    );  

    // Mint Farmer NFT for user
    farmer_nft_token_mint = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userFarmerTokenAccount = await farmer_nft_token_mint.createAccount(user.publicKey);
    
    await farmer_nft_token_mint.mintTo(
      userFarmerTokenAccount,
      superOwner,
      [],
      1
    );  
    console.log("farmer NFT = ", farmer_nft_token_mint.publicKey.toBase58(), userFarmerTokenAccount.toBase58());

    // Mint another Farmer NFT for user
    farmer_nft_token_mint1 = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userFarmerTokenAccount1 = await farmer_nft_token_mint1.createAccount(user.publicKey);
    
    await farmer_nft_token_mint1.mintTo(
      userFarmerTokenAccount1,
      superOwner,
      [],
      1
    );  
    console.log("farmer NFT1 = ", farmer_nft_token_mint1.publicKey.toBase58(), userFarmerTokenAccount1.toBase58());

    // Mint another Farmer NFT for user
    farmer_nft_token_mint2 = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userFarmerTokenAccount2 = await farmer_nft_token_mint2.createAccount(user.publicKey);
    
    await farmer_nft_token_mint2.mintTo(
      userFarmerTokenAccount2,
      superOwner,
      [],
      1
    );  

    // Mint another Farmer NFT for user
    farmer_nft_token_mint3 = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userFarmerTokenAccount3 = await farmer_nft_token_mint3.createAccount(user.publicKey);
    
    await farmer_nft_token_mint3.mintTo(
      userFarmerTokenAccount3,
      superOwner,
      [],
      1
    );  

    // Mint another Farmer NFT for user
    farmer_nft_token_mint4 = await Token.createMint(
      provider.connection,
      user,
      superOwner.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );
    userFarmerTokenAccount4 = await farmer_nft_token_mint4.createAccount(user.publicKey);
    
    await farmer_nft_token_mint4.mintTo(
      userFarmerTokenAccount4,
      superOwner,
      [],
      1
    );  

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );
    
    console.log("globalAuthority =", globalAuthority.toBase58());
    
    // Mint reward tokens to rewardVault for superOwner
    reward_token_mint = await Token.createMint(
      provider.connection,
      superOwner,
      superOwner.publicKey,
      null,
      9,
      TOKEN_PROGRAM_ID
    );
    userRewardTokenAccount = await reward_token_mint.createAccount(user.publicKey);
    rewardVault = await reward_token_mint.createAccount(globalAuthority);
    await reward_token_mint.mintTo(
      rewardVault,
      superOwner,
      [],
      10_000_000_000,
    );
    console.log("reward token = ", reward_token_mint.publicKey.toBase58());
    console.log(await provider.connection.getTokenAccountBalance(rewardVault));
    
    const tx = await program.rpc.initialize(
      bump, {
        accounts: {
          admin: superOwner.publicKey,
          globalAuthority,
          rewardVault,
          systemProgram: SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY
        },
        signers: [superOwner]
      }
    );

    console.log("Your transaction signature", tx);

    let globalAccount = await program.account.globalBarn.fetch(globalAuthority);
    console.log("globalAccount = ", globalAccount.superAdmin.toBase58(), globalAccount.landStakedCnt.toNumber());
  });

  it('initialize user barn', async () => {

    let userBarnKey = await PublicKey.createWithSeed(
      user.publicKey,
      "user-barn",
      program.programId,
    );
    console.log(USER_BARN_SIZE);
    let ix = SystemProgram.createAccountWithSeed({
      fromPubkey: user.publicKey,
      basePubkey: user.publicKey,
      seed: "user-barn",
      newAccountPubkey: userBarnKey,
      lamports : await provider.connection.getMinimumBalanceForRentExemption(USER_BARN_SIZE),
      space: USER_BARN_SIZE,
      programId: program.programId,
    });
    console.log("userBarn.pubk =", userBarnKey.toBase58())
    const tx = await program.rpc.initializeBarn(
      {
        accounts: {
          userBarn: userBarnKey,
          owner: user.publicKey
        },
        instructions: [
          ix
        ],
        signers: [user]
      }
    );

    console.log("Your transaction signature", tx);
    let barnAccount = await program.account.userBarn.fetch(userBarnKey);
    console.log('Owner of initialized barn = ', barnAccount.owner.toBase58());
  })
  
  it("Stake Nfts To Barn", async () => {
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );

    console.log("globalAuthority =", globalAuthority.toBase58());

    let userBarnKey = await PublicKey.createWithSeed(
      user.publicKey,
      "user-barn",
      program.programId,
    );

    /*let destNftTokenAccount = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID, 
      TOKEN_PROGRAM_ID,
      nft_token_mint.publicKey,
      user.publicKey
    );*/

    // const [staked_nft_address, nft_bump] = await PublicKey.findProgramAddress(
    //   [Buffer.from("staked-nft"), nft_token_mint.publicKey.toBuffer()],
    //   program.programId
    // );

    let tx = new Transaction();
    let remainingAccounts = [];
    let {instructions, destinationAccounts} = await getATokenAccountsNeedCreate(
      provider.connection,
      user.publicKey,
      globalAuthority,
      [
        nft_token_mint.publicKey,
        anim_nft_token_mint.publicKey,
        anim_nft_token_mint1.publicKey,
        anim_nft_token_mint2.publicKey,
      ]
    );
    
    if (instructions.length > 0) {
      tx.add(...instructions);
    }

    let idx = 0, nft_mints: anchor.web3.PublicKey[] = [], nft_types: number[] = [];
    for (let i = 0; i < 7; i++) {
      nft_mints.push(SystemProgram.programId);
      nft_types.push(0);   // land_nft
    }

    nft_mints[idx] = nft_token_mint.publicKey;
    nft_types[idx] = 0;    // land_nft
    remainingAccounts.push({
      pubkey: userTokenAccount,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: destinationAccounts[idx++],
      isWritable: true,
      isSigner: false,
    });
    
    nft_mints[idx] = anim_nft_token_mint.publicKey;
    nft_types[idx] = 1;    // anim_nft
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

    nft_mints[idx] = anim_nft_token_mint1.publicKey;
    nft_types[idx] = 1;    // anim_nft
    remainingAccounts.push({
      pubkey: userAnimTokenAccount1,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: destinationAccounts[idx++],
      isWritable: true,
      isSigner: false,
    });

    nft_mints[idx] = anim_nft_token_mint2.publicKey;
    nft_types[idx] = 1;    // anim_nft
    remainingAccounts.push({
      pubkey: userAnimTokenAccount2,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: destinationAccounts[idx++],
      isWritable: true,
      isSigner: false,
    });

    let txId = await provider.connection.sendTransaction(tx, [user]);
    console.log("Your transaction signature", tx.signatures[0]);
    let transferTxId = await provider.connection.confirmTransaction(txId, 'singleGossip');
    
    tx = new Transaction();
    let res1 = await getATokenAccountsNeedCreate(
      provider.connection,
      user.publicKey,
      globalAuthority,
      [
        farmer_nft_token_mint.publicKey,
        farmer_nft_token_mint1.publicKey,
        farmer_nft_token_mint2.publicKey,
      ]
    );

    if (res1.instructions.length > 0) {
      tx.add(...res1.instructions);
    }

    nft_mints[idx] = farmer_nft_token_mint.publicKey;
    nft_types[idx] = 2;    // farmer_nft
    remainingAccounts.push({
      pubkey: userFarmerTokenAccount,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: res1.destinationAccounts[idx - 4],
      isWritable: true,
      isSigner: false,
    });
    idx++;
    nft_mints[idx] = farmer_nft_token_mint1.publicKey;
    nft_types[idx] = 2;    // farmer_nft
    remainingAccounts.push({
      pubkey: userFarmerTokenAccount1,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: res1.destinationAccounts[idx - 4],
      isWritable: true,
      isSigner: false,
    });
    idx++;
    nft_mints[idx] = farmer_nft_token_mint2.publicKey;
    nft_types[idx] = 2;    // farmer_nft
    remainingAccounts.push({
      pubkey: userFarmerTokenAccount2,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: res1.destinationAccounts[idx - 4],
      isWritable: true,
      isSigner: false,
    });

    txId = await provider.connection.sendTransaction(tx, [user]);
    console.log("Your transaction signature", tx.signatures[0]);
    transferTxId = await provider.connection.confirmTransaction(txId, 'singleGossip');

    const sig = await program.rpc.initYarnStaking(
      bump, 7, nft_mints, nft_types, {
        accounts: {
          owner: user.publicKey,
          userBarn: userBarnKey,
          globalAuthority,
          tokenProgram: TOKEN_PROGRAM_ID,
          // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          // systemProgram: SystemProgram.programId,
          // rent: SYSVAR_RENT_PUBKEY
        },
        remainingAccounts,
        signers: [user],
      }
    )
    
    // tx.setSigners(
    //   ...([user.publicKey]),
    // );
    // tx.recentBlockhash = (await provider.connection.getRecentBlockhash("max")).blockhash;
    // let signed = await user.signTransaction(tx) as any;
    // let txid = await connection.sendRawTransaction(signed?.serialize(), {
    //   skipPreflight: false,
    //   preflightCommitment: 'singleGossip'
    // });
    // const transferTxId = await connection.confirmTransaction(txid, 'singleGossip');
    
    // let txId = await provider.connection.sendTransaction(tx, [user]);
    // console.log("Your transaction signature", tx.signatures[0]);
    // const transferTxId = await provider.connection.confirmTransaction(txId, 'singleGossip');

    console.log(`Succeed. Your signature is ${sig}`);
    
    // await provider.connection.sendTransaction(tx, [user]);
    // console.log("Your transaction signature", tx.signatures[0]);
    
    let userBarn = await program.account.userBarn.fetch(userBarnKey);
    console.log("userBarn =", userBarn.rewardTime.toString());
    console.log({
      ...userBarn,
      yards: [],
    });
  })

  it("Withdraw Staked Yard", async () => {

    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );

    console.log("globalAuthority =", globalAuthority.toBase58());

    let userBarnKey = await PublicKey.createWithSeed(
      user.publicKey,
      "user-barn",
      program.programId,
    );

    let {instructions, destinationAccounts} = await getATokenAccountsNeedCreate(
      provider.connection,
      user.publicKey,
      globalAuthority,
      [
        nft_token_mint.publicKey,
        anim_nft_token_mint.publicKey,
        anim_nft_token_mint1.publicKey,
        anim_nft_token_mint2.publicKey,
        farmer_nft_token_mint.publicKey,
        farmer_nft_token_mint1.publicKey,
        farmer_nft_token_mint2.publicKey,
      ]
    );

    let idx = 0, nft_mints: anchor.web3.PublicKey[] = [], nft_types: number[] = [];
    for (let i = 0; i < 7; i++) {
      nft_mints.push(SystemProgram.programId);
      nft_types.push(0);   // land_nft
    }
    let remainingAccounts = [];

    nft_mints[idx] = nft_token_mint.publicKey;
    nft_types[idx] = 0;    // land_nft
    remainingAccounts.push({
      pubkey: userTokenAccount,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: destinationAccounts[idx++],
      isWritable: true,
      isSigner: false,
    });

    nft_mints[idx] = anim_nft_token_mint.publicKey;
    nft_types[idx] = 1;    // anim_nft
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
    
    nft_mints[idx] = anim_nft_token_mint1.publicKey;
    nft_types[idx] = 1;    // anim_nft
    remainingAccounts.push({
      pubkey: userAnimTokenAccount1,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: destinationAccounts[idx++],
      isWritable: true,
      isSigner: false,
    });
    
    nft_mints[idx] = anim_nft_token_mint2.publicKey;
    nft_types[idx] = 1;    // anim_nft
    remainingAccounts.push({
      pubkey: userAnimTokenAccount2,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: destinationAccounts[idx++],
      isWritable: true,
      isSigner: false,
    });

    nft_mints[idx] = farmer_nft_token_mint.publicKey;
    nft_types[idx] = 2;    // farmer_nft
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
    
    nft_mints[idx] = farmer_nft_token_mint1.publicKey;
    nft_types[idx] = 2;    // farmer_nft
    remainingAccounts.push({
      pubkey: userFarmerTokenAccount1,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: destinationAccounts[idx++],
      isWritable: true,
      isSigner: false,
    });
    
    nft_mints[idx] = farmer_nft_token_mint2.publicKey;
    nft_types[idx] = 2;    // farmer_nft
    remainingAccounts.push({
      pubkey: userFarmerTokenAccount2,
      isWritable: true,
      isSigner: false,
    });
    remainingAccounts.push({
      pubkey: destinationAccounts[idx++],
      isWritable: true,
      isSigner: false,
    });

    const sig = await program.rpc.withdrawStakedYard(
      bump, 7, nft_mints, nft_types, {
        accounts: {
          owner: user.publicKey,
          userBarn: userBarnKey,
          globalAuthority,
          tokenProgram: TOKEN_PROGRAM_ID,
          // associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          // systemProgram: SystemProgram.programId,
          // rent: SYSVAR_RENT_PUBKEY
        },
        remainingAccounts,
        signers: [user],
      }
    )
    
    // tx.setSigners(
    //   ...([user.publicKey]),
    // );
    // tx.recentBlockhash = (await provider.connection.getRecentBlockhash("max")).blockhash;
    // let signed = await user.signTransaction(tx) as any;
    // let txid = await connection.sendRawTransaction(signed?.serialize(), {
    //   skipPreflight: false,
    //   preflightCommitment: 'singleGossip'
    // });
    // const transferTxId = await connection.confirmTransaction(txid, 'singleGossip');
    
    // let txId = await provider.connection.sendTransaction(tx, [user]);
    // console.log("Your transaction signature", tx.signatures[0]);
    // const transferTxId = await provider.connection.confirmTransaction(txId, 'singleGossip');

    console.log(`Succeed. Your signature is ${sig}`);
    
    let userBarn = await program.account.userBarn.fetch(userBarnKey);
    console.log("userBarn =", userBarn.rewardTime.toString());
    console.log({
      ...userBarn,
      yards: [],
    });
  })

  it("Claim Reward", async () => {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(1);
      }, 3000);
    });
    const [globalAuthority, bump] = await PublicKey.findProgramAddress(
      [Buffer.from(GLOBAL_AUTHORITY_SEED)],
      program.programId
    );

    console.log("globalAuthority =", globalAuthority.toBase58());

    let userBarnKey = await PublicKey.createWithSeed(
      user.publicKey,
      "user-barn",
      program.programId,
    );

    const tx = await program.rpc.claimReward(
      bump, {
        accounts: {
          owner: user.publicKey,
          userBarn: userBarnKey,
          globalAuthority,
          rewardVault,
          userRewardAccount: userRewardTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [user]
      }
    );
    
    console.log("Your transaction signature", tx); 
    
    let userBarn = await program.account.userBarn.fetch(userBarnKey);
    console.log("userBarn =", userBarn.rewardTime.toString());
    console.log({
      ...userBarn,
      yards: [],
    });
  })
});

export const getATokenAccountsNeedCreate = async (
  connection: anchor.web3.Connection,
  walletAddress: anchor.web3.PublicKey,
  owner: anchor.web3.PublicKey,
  nfts: anchor.web3.PublicKey[],
) => {
  let instructions = [], destinationAccounts = [];
  for (const mint of nfts) {
    const destinationPubkey = await getTokenWallet(owner, mint);
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

export const getTokenWallet = async (
  wallet: anchor.web3.PublicKey,
  mint: anchor.web3.PublicKey
) => {
  return (
    await anchor.web3.PublicKey.findProgramAddress(
      [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  )[0];
};

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
