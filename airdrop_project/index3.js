import base58 from 'bs58';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const{
    Connection, //用于连接solana
    PublicKey,  //模块化处理公钥
    clusterApiUrl,
    Keypair,
    LAMPORTS_PER_SOL, //一个固定常量，一个solana可以兑换10亿个Lamports
    Transaction,
    SystemInstruction,
    SystemProgram,
    sendAndConfirmRawTransaction,
    TransactionMessage,
    VersionedTransaction
}=require("@solana/web3.js")//等价于：import Keypair from "@solana/web3.js" 

//利用账户2私钥创建钱包：4RrFnT6xxssJDB5kVSo8fYpvADQgCe3rdH3jDP2uDdE49MFKufmtWXaaHzThigJeXuw8ZGTuxQiu8YmVdLiRug5g
const wallet = Keypair.fromSecretKey(base58.decode('4RrFnT6xxssJDB5kVSo8fYpvADQgCe3rdH3jDP2uDdE49MFKufmtWXaaHzThigJeXuw8ZGTuxQiu8YmVdLiRug5g'))
const publicKey_ = wallet.publicKey.toBase58() //公钥【数组型->字符串型】方式
const secretKey = base58.encode(wallet.secretKey)//人钥【数组型->字符串型】方式
console.log(`公钥地址：`,publicKey_)
console.log(`私钥：`,secretKey)

const devconnection = new Connection("https://devnet.helius-rpc.com/?api-key=911b0add-16e3-4ce7-a915-78590a72b5ee")

//solana上，所有账户所占用的空间都需要自付空间
//定义分配的空间，这个例子中不需要分配额外空间，
const space = 0;
//押金：请求0字节的最小免租金 小数SOL的小额支付，这被称为lamports,价值是0.000000001 SOL。
const lamports = await devconnection.getMinimumBalanceForRentExemption(space)
console.log("Total 押金",lamports)

//新建一个钱包
const keypair = Keypair.generate()

//指令1：使用系统程序创建账户
const createAccountIx = SystemProgram.createAccount({
    fromPubkey:wallet.publicKey,
    newAccountPubkey:keypair.publicKey,
    lamports:lamports+2_000_000,
    space,
    programId:SystemProgram.programId,//使用系统程序作为所有者
});


//指令2:转账操作：
const transferToTestWalletIx = SystemProgram.transfer({
    lamports:lamports+100_000,
    fromPubkey:wallet.publicKey,
    toPubkey:keypair.publicKey,
    programId:SystemProgram.programId,
});

//指令三：转账给本地账户
const transferToLocalWalletIx = SystemProgram.transfer({
    lamports:lamports+100_000_000,
    fromPubkey:wallet.publicKey,
    toPubkey:new PublicKey("6ggrda5uzAj4XHjmewGQYMdZxKSc2AgsnLNZndWsqfLJ"),
    programId:SystemProgram.programId,
});

//每一个交易都要关联最近的区块哈希，以便请求最新的区块哈希
//通过连接获取最近区块哈希,并结构
let recentBlockhash = await devconnection.getLatestBlockhash().then(res => res.blockhash);


//构建交易 ,交易包含多个指令
const message = new TransactionMessage({
    payerKey:wallet.publicKey,
    recentBlockhash,
    //按照顺序执行，任何一个指令失败，整个交易都会失败
    instructions:[
        createAccountIx,
        transferToLocalWalletIx,
        transferToTestWalletIx,
        transferToLocalWalletIx, 
    ],//将指令添加到数组中
}).compileToV0Message();
const tx = new VersionedTransaction(message);

//签名
tx.sign([wallet,keypair]);
console.log("sign的 tx",tx)
//通过连接将交易发送给区块链
const sig = await devconnection.sendTransaction(tx);
