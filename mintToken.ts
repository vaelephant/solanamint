import { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, AccountInfo } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import * as fs from 'fs';

import * as path from 'path';


// 定义钱包文件路径
const walletPath = path.join(__dirname, 'wallet.json');

async function createAndMintToken() {
    try {
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        console.log("连接到Solana的开发网络...");

        let fromWallet;
        
        // 检查是否存在钱包文件
        if (fs.existsSync(walletPath)) {
            console.log("加载已有的钱包密钥对...");
            const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
            fromWallet = Keypair.fromSecretKey(new Uint8Array(walletData.secretKey));
        } else {
            console.log("生成新的钱包密钥对并保存...");
            fromWallet = Keypair.generate();
            fs.writeFileSync(walletPath, JSON.stringify({
                publicKey: fromWallet.publicKey.toString(),
                secretKey: Array.from(fromWallet.secretKey)
            }, null, 2));
        }
        console.log(`钱包公钥: ${fromWallet.publicKey.toString()}`);

        // 检查账户SOL余额
        const balance = await connection.getBalance(fromWallet.publicKey);
        console.log(`当前SOL余额: ${balance / LAMPORTS_PER_SOL} SOL`);

        if (balance < LAMPORTS_PER_SOL) {
            console.log("请求空投SOL...");
            const airdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
            await connection.confirmTransaction(airdropSignature, 'confirmed');
            console.log("空投SOL已确认。");
        }

        console.log("创建新的代币mint...");
        const mint = await createMint(connection, fromWallet, fromWallet.publicKey, null, 9);
        console.log(`代币Mint已创建，地址: ${mint.toString()}`);

        console.log("创建与这个Mint关联的Token账户...");
        const tokenAccount = await getOrCreateAssociatedTokenAccount(connection, fromWallet, mint, fromWallet.publicKey);
        console.log(`Token账户已创建，地址: ${tokenAccount.address.toString()}`);

        console.log("铸造新代币到刚创建的账户...");
        await mintTo(connection, fromWallet, mint, tokenAccount.address, fromWallet, 8 * Math.pow(10, 9));
        console.log("代币铸造完成。");

    } catch (err) {
        console.error("脚本执行过程中发生错误:", err);
    }
}

createAndMintToken().catch(err => {
    console.error("创建和铸造代币过程中捕获到未处理的错误:", err);
});
