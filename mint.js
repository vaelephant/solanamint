import { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, TOKEN_PROGRAM_ID } from '@solana/spl-token';

async function createAndMintToken() {
    try {
        console.log("连接到Solana的开发网络...");
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        console.log("已成功连接到Solana的开发网络");

        console.log("生成钱包密钥对...");
        const fromWallet = Keypair.generate();
        console.log(`钱包密钥对已生成，公钥为: ${fromWallet.publicKey.toString()}`);

        console.log("请求空投SOL...");
        const airdropSignature = await connection.requestAirdrop(
            fromWallet.publicKey,
            LAMPORTS_PER_SOL // 相当于1 SOL
        );
        console.log(`空投请求已发送，交易签名: ${airdropSignature}`);

        console.log("确认交易...");
        await connection.confirmTransaction(airdropSignature, 'confirmed');
        console.log(`交易已确认，签名: ${airdropSignature}`);

        console.log("创建新的代币mint...");
        const mint = await createMint(
            connection,
            fromWallet,
            fromWallet.publicKey,
            null,
            9 // 小数位数
        );
        console.log(`代币mint已创建，地址为: ${mint.toString()}`);

        console.log("创建与这个mint关联的token账户...");
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey
        );
        console.log(`与代币mint关联的token账户已创建，地址为: ${tokenAccount.address.toString()}`);

        console.log("铸造新代币到刚创建的账户...");
        const mintAmount = 888 * Math.pow(10, 9); // 根据小数位数调整铸造数量
        await mintTo(
            connection,
            fromWallet,
            mint,
            tokenAccount.address,
            fromWallet,
            mintAmount // 铸造的代币数量，已调整为888个代币
        );
        console.log(`已成功铸造代币，数量: 888，铸造至账户: ${tokenAccount.address.toString()}`);

    } catch (err) {
        console.error("脚本执行过程中发生错误:", err);
    }
}

createAndMintToken().catch(err => {
    console.error("创建和铸造代币过程中捕获到未处理的错误:", err);
});
