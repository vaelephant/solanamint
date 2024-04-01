"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var web3_js_1 = require("@solana/web3.js");
var spl_token_1 = require("@solana/spl-token");
var fs = require("fs");
var path = require("path");
// 定义钱包文件路径
var walletPath = path.join(__dirname, 'wallet.json');
//定义铸币个数
var initmintAmount = 99;
function createAndMintToken() {
    return __awaiter(this, void 0, void 0, function () {
        var connection, fromWallet, walletData, balance, airdropSignature, mint, tokenAccount, mintAmount, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Solana铸币开始...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    connection = new web3_js_1.Connection((0, web3_js_1.clusterApiUrl)('devnet'), 'confirmed');
                    console.log("连接到Solana的开发网络...");
                    fromWallet = void 0;
                    // 检查是否存在钱包文件
                    if (fs.existsSync(walletPath)) {
                        console.log("加载已有的钱包密钥对...");
                        walletData = JSON.parse(fs.readFileSync(walletPath, 'utf-8'));
                        fromWallet = web3_js_1.Keypair.fromSecretKey(new Uint8Array(walletData.secretKey));
                    }
                    else {
                        console.log("生成新的钱包密钥对并保存...");
                        fromWallet = web3_js_1.Keypair.generate();
                        fs.writeFileSync(walletPath, JSON.stringify({
                            publicKey: fromWallet.publicKey.toString(),
                            secretKey: Array.from(fromWallet.secretKey)
                        }, null, 2));
                    }
                    console.log("\u94B1\u5305\u516C\u94A5: ".concat(fromWallet.publicKey.toString()));
                    return [4 /*yield*/, connection.getBalance(fromWallet.publicKey)];
                case 2:
                    balance = _a.sent();
                    console.log("\u5F53\u524DSOL\u4F59\u989D: ".concat(balance / web3_js_1.LAMPORTS_PER_SOL, " SOL"));
                    if (!(balance < web3_js_1.LAMPORTS_PER_SOL)) return [3 /*break*/, 5];
                    console.log("请求空投SOL...");
                    return [4 /*yield*/, connection.requestAirdrop(fromWallet.publicKey, web3_js_1.LAMPORTS_PER_SOL)];
                case 3:
                    airdropSignature = _a.sent();
                    return [4 /*yield*/, connection.confirmTransaction(airdropSignature, 'confirmed')];
                case 4:
                    _a.sent();
                    console.log("空投SOL已确认。");
                    _a.label = 5;
                case 5:
                    console.log("创建新的代币mint...");
                    return [4 /*yield*/, (0, spl_token_1.createMint)(connection, fromWallet, fromWallet.publicKey, null, 9 // 小数位数
                        )];
                case 6:
                    mint = _a.sent();
                    console.log("\u4EE3\u5E01Mint\u5DF2\u521B\u5EFA\uFF0C\u5730\u5740: ".concat(mint.toString()));
                    console.log("创建与这个Mint关联的Token账户...");
                    return [4 /*yield*/, (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, fromWallet, mint, fromWallet.publicKey)];
                case 7:
                    tokenAccount = _a.sent();
                    console.log("\u4E0E\u4EE3\u5E01mint\u5173\u8054\u7684token\u8D26\u6237\u5DF2\u521B\u5EFA\uFF0C\u5730\u5740\u4E3A: ".concat(tokenAccount.address.toString()));
                    console.log("铸造新代币到刚创建的账户...");
                    mintAmount = initmintAmount * Math.pow(10, 9);
                    return [4 /*yield*/, (0, spl_token_1.mintTo)(connection, fromWallet, mint, tokenAccount.address, fromWallet, mintAmount)];
                case 8:
                    _a.sent();
                    console.log("\u5DF2\u6210\u529F\u94F8\u9020\u4EE3\u5E01\uFF0C\u6570\u91CF: ".concat(initmintAmount, "\uFF0C\u94F8\u9020\u81F3\u8D26\u6237: ").concat(tokenAccount.address.toString()));
                    // 打印代币账户的Solscan链接
                    console.log("\u67E5\u770B\u4EE3\u5E01\u8D26\u6237\u8BE6\u60C5: https://solscan.io/account/".concat(tokenAccount.address.toString(), "?cluster=devnet"));
                    return [3 /*break*/, 10];
                case 9:
                    err_1 = _a.sent();
                    console.error("脚本执行过程中发生错误:", err_1);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
createAndMintToken().catch(function (err) {
    console.error("创建和铸造代币过程中捕获到未处理的错误:", err);
});
