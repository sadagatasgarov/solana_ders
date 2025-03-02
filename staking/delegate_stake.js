const { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, StakeProgram, Authorized, Lockup, sendAndConfirmTransaction, PublicKey } = require("@solana/web3.js")


// // Cüzdanınızı JSON dosyasından yükleyin (örneğin: keypair.json)
// const fs = require('fs');

// // Eğer secret key Uint8Array formatındaysa:
// const secretKey = JSON.parse(fs.readFileSync("/home/sadagat/.config/solana/id.json", "utf8"));
// const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));




const main = async () => {

    // const connection = new Connection("https://api.devnet.solana.com", 'processed');

    // // Bakiye kontrolü
    // let balance = await connection.getBalance(wallet.publicKey);
    // console.log(`Wallet Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    // // Eğer yeterli bakiye yoksa, airdrop isteği yap
    // if (balance < LAMPORTS_PER_SOL) {
    //     console.log("Airdrop alınıyor...");
    //     const airdropSignature = await connection.requestAirdrop(wallet.publicKey, 1 * LAMPORTS_PER_SOL);
    //     await connection.confirmTransaction(airdropSignature);
    //     console.log("Airdrop tamamlandı!");
    // }

//--------
    const connection = new Connection(clusterApiUrl('devnet'), 'processed');
    const wallet = Keypair.generate();
    const airdropSignatue = await connection.requestAirdrop(
        wallet.publicKey,
        1 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(airdropSignatue);
//----------

    const stakeAccount = Keypair.generate();
    const minimumRent = await connection.getMinimumBalanceForRentExemption(StakeProgram.space);
    const amountUserWantsToStake = 0.1 * LAMPORTS_PER_SOL;
    const amountToStake = minimumRent + amountUserWantsToStake;
    const createStakeAccountTx = StakeProgram.createAccount({
        authorized: new Authorized(wallet.publicKey, wallet.publicKey),
        fromPubkey: wallet.publicKey,
        lamports: amountToStake,
        lockup: new Lockup(0, 0, wallet.publicKey),
        stakePubkey: stakeAccount.publicKey
    });

    const createStakeAccountTxId = await sendAndConfirmTransaction(connection, createStakeAccountTx, [wallet, stakeAccount]);
    console.log(`Stake account created. Tx Id: ${createStakeAccountTxId}`);

    let stakeBalance = await connection.getBalance(stakeAccount.publicKey);
    console.log(`Stake account balance: ${stakeBalance / LAMPORTS_PER_SOL} SOL`);

    // await new Promise(resolve => setTimeout(resolve, 120000));
    let stakeStatus = await connection.getAccountInfo(
        stakeAccount.publicKey
    )
    console.log(`Stake account status: ${stakeStatus.state}`);

    const validators = await connection.getVoteAccounts();

    const selectValidator = validators.current[0];
    const selectValidatorPubkey = new PublicKey(selectValidator.votePubkey);
    const delegateTx = StakeProgram.delegate({
        stakePubkey: stakeAccount.publicKey,
        authorizedPubkey: wallet.publicKey,
        votePubkey: selectValidatorPubkey,
    });

    const delegateTxId = await sendAndConfirmTransaction(connection, delegateTx, [wallet]);
    console.log(`Stake account delegated to ${selectValidatorPubkey}. Tx Id: ${delegateTxId}`);



    // await new Promise(resolve => setTimeout(resolve, 120000));
    stakeStatus = await connection.getAccountInfo(
        stakeAccount.publicKey
    );

    console.log(`Stake account status: ${stakeStatus.state}`);


};




const runMain = async () => {
    try {
        await main()
    } catch (error) {
        console.log(error)
    }
}

runMain();