const { Connection, clusterApiUrl } = require("@solana/web3.js")


const main = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'processed'); 
    const {current, delinquent} = await connection.getVoteAccounts();
    console.log('all vlidators: ' + current.concat(delinquent).length);
    console.log('current vlidators ' + current.length);
    console.log(current[0])
};



const runMain = async () => {
    try {
        await main()
    } catch (error) {
        console.log(error)
    }
}

runMain();