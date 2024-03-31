const web3 = require('@solana/web3.js');
const splToken = require('@solana/spl-token');

async function createToken() {
// 连接到Solana devnet
const connection = new web3.Connection(web3.clusterApiUrl('devnet'));
// 创建新的wallet和密钥对
const fromWallet = web3.Keypair.generate();

// 为钱包账户提供一些SOL（需要在测试网络上测试）
const airdropSignature = await connection.requestAirdrop(
    fromWallet.publicKey,
    web3.LAMPORTS_PER_SOL,
);
await connection.confirmTransaction(airdropSignature);

// 创建新的mint
const mint = await splToken.Token.createMint(
    connection,
    fromWallet,
    fromWallet.publicKey,
    null,
    9, // 小数位数
    splToken.TOKEN_PROGRAM_ID,
);

// 创建与这个mint关联的token账户
const tokenAccount = await mint.getOrCreateAssociatedAccountInfo(
    fromWallet.publicKey
);

// 铸造新代币到刚创建的账户
await mint.mintTo(
    tokenAccount.address,
    fromWallet.publicKey,
    [],
    1000000000 // 铸造数量（记得考虑小数位）
);

console.log("Mint address:", mint.publicKey.toString());
console.log("Token account address:", tokenAccount.address.toString());
console.log("Token account balance:", (await mint.getAccountInfo(tokenAccount.address)).amount.toString());
createToken().catch(err => {
console.error(err);
});
}
