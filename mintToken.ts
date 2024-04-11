import { Connection, clusterApiUrl, Keypair, LAMPORTS_PER_SOL, AccountInfo } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import * as fs from 'fs';
import * as path from 'path';
import { getAccount } from '@solana/spl-token';


// 定义钱包文件路径
const walletPath = path.join(__dirname, 'wallet.json');
//定义铸币个数
const initmintAmount = 99;

async function createAndMintToken() {
    console.log("Solana铸币开始...");
    try {
        console.log("第一步:链接到网路...");
        const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
        console.log("连接到Solana的开发网络...");

        let fromWallet;

        // 检查是否存在钱包文件
        console.log("第二步:检查本地是否有秘钥...");
        if (fs.existsSync(walletPath)) {
            console.log("加载已有的钱包密钥对...");
            const walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
            fromWallet = Keypair.fromSecretKey(new Uint8Array(walletData.secretKey));
            console.log("加载已有的钱包密钥对 成功" + fromWallet);
        } else {
            console.log("无钱包秘钥，生成新的钱包密钥对并保存...");
            fromWallet = Keypair.generate();
            fs.writeFileSync(walletPath, JSON.stringify({
                publicKey: fromWallet.publicKey.toString(),
                secretKey: Array.from(fromWallet.secretKey)
            }, null, 2));
            console.log("生成的钱包秘钥保存成功")
        }
        console.log(`钱包公钥: ${fromWallet.publicKey.toString()}`);

        // 检查账户SOL余额
        console.log("第三步:查秘钥地址余额...");
        const balance = await connection.getBalance(fromWallet.publicKey);
        console.log(`当前SOL余额: ${balance / LAMPORTS_PER_SOL} SOL`);

        if (balance < LAMPORTS_PER_SOL) {
            console.log("请求空投SOL...");
            const airdropSignature = await connection.requestAirdrop(fromWallet.publicKey, LAMPORTS_PER_SOL);
            await connection.confirmTransaction(airdropSignature, 'confirmed');
            console.log("空投SOL已确认。");
            // 检查空投后账户SOL余额
            const balance = await connection.getBalance(fromWallet.publicKey);
            console.log(`空投后当前SOL余额: ${balance / LAMPORTS_PER_SOL} SOL`);
        }
        console.log("第四步；创建代币开始...");
        
        const mint = await createMint(
            connection,
            fromWallet,
            fromWallet.publicKey,
            null,
            9 // 小数位数
        );
        console.log(`代币Mint已创建，地址: ${mint.toString()}`);

        console.log("第五步：创建与这个Mint关联的Token账户...");
        const tokenAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            fromWallet,
            mint,
            fromWallet.publicKey
        );
        console.log(`创建与代币mint关联的token账户，账号为: ${tokenAccount.address.toString()}`);

        console.log("第六步:铸造新代币到刚创建的账户...");
        const mintAmount = initmintAmount * Math.pow(10, 9); // 根据小数位数调整铸造数量
        await mintTo(
            connection,
            fromWallet,
            mint,
            tokenAccount.address,
            fromWallet,
            mintAmount
        );
        console.log(`第七步：已成功铸造代币，数量: ${initmintAmount}，铸造至账户: ${tokenAccount.address.toString()}`);
        // 修改这里
        try {
            const tokenInfo = await getAccount(connection, tokenAccount.address);
            console.log("Token account address:", tokenAccount.address.toString());
            console.log("Token account balance:", tokenInfo.amount.toString());
        } catch (error) {
            console.error("获取代币账户信息时出错:", error);
        }  // 打印代币账户的Solscan链接
        console.log(`查看代币账户详情: https://solscan.io/account/${tokenAccount.address.toString()}?cluster=devnet`);


    } catch (err) {
        console.error("脚本执行过程中发生错误:", err);
    }
}

createAndMintToken().catch(err => {
    console.error("创建和铸造代币过程中捕获到未处理的错误:", err);
});
