import { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token';

async function createAndMintToken() {
    try {
        console.log("连接到Solana的开发网络...");
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

        console.log("生成钱包密钥对...");
        const fromWallet = Keypair.generate();

        console.log("请求空投SOL...");
        const airdropSignature = await connection.requestAirdrop(
            fromWallet.publicKey,
            LAMPORTS_PER_SOL // 相当于1 SOL
        );

        console.log("确认交易...");
        await connection.confirmTransaction(airdropSignature);

        console.log("创建新的代币mint...");
        const mint = await createMint(
            connection,
            fromWallet,
            fromWallet.publicKey,
            null,
            9 // 小数位数
        );

        console.log("创建与这个mint关联的token账户...");
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey
        );

        console.log("铸造新代币到刚创建的账户...");
        await mintTo(
            connection,
            fromWallet,
            mint,
            tokenAccount.address,
            fromWallet,
            1000000000 // 铸造的代币数量，考虑小数位数
        );

        console.log("Mint address:", mint.toString());
        console.log("Token account address:", tokenAccount.address.toString());
    } catch (err) {
        console.error("脚本执行过程中发生错误:", err);
    }
}

createAndMintToken().catch(err => {
    console.error("创建和铸造代币过程中捕获到未处理的错误:", err);
});