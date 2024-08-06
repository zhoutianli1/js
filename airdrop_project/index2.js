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


// =本地钱包公钥: 6ggrda5uzAj4XHjmewGQYMdZxKSc2AgsnLNZndWsqfLJ
// =幻影钱包链接的账户1公钥：2qwEEhWKVBfYae5JxKFr7ExtAWf5QyuaMTuBF7qLxcEB
// =幻影钱包链接的账户2公钥：J965TowEnmtKj3Pivn56G4VkbxQQCtSz23agKkEkBfvJ


//利用账户2私钥创建钱包：4RrFnT6xxssJDB5kVSo8fYpvADQgCe3rdH3jDP2uDdE49MFKufmtWXaaHzThigJeXuw8ZGTuxQiu8YmVdLiRug5g
const wallet = Keypair.fromSecretKey(base58.decode('4RrFnT6xxssJDB5kVSo8fYpvADQgCe3rdH3jDP2uDdE49MFKufmtWXaaHzThigJeXuw8ZGTuxQiu8YmVdLiRug5g'))

//获取钱包凭证：（包含一个公钥和私钥）
const publicKey_ = wallet.publicKey.toBase58() //公钥【数组型->字符串型】方式
const secretKey = base58.encode(wallet.secretKey)//人钥【数组型->字符串型】方式
console.log(`公钥地址：`,publicKey_)
console.log(`私钥：`,secretKey)
console.log(`数组型私钥-去空字符串：`,wallet.secretKey.toString())

const devconnection = new Connection("https://devnet.helius-rpc.com/?api-key=911b0add-16e3-4ce7-a915-78590a72b5ee")
const curentBalance = await devconnection.getBalance(wallet.publicKey)
console.log(`钱包余额：`,curentBalance)

if (curentBalance <= LAMPORTS_PER_SOL){
    console.log(`余额太少，请求空头：`);
    await devconnection.requestAirdrop(wallet.publicKey,2*LAMPORTS_PER_SOL);
}

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
    fromPubkey:wallet.publicKey, //账户1
    newAccountPubkey:keypair.publicKey, //新建的钱包
    lamports:lamports,
    space,
    programId:SystemProgram.programId,//使用系统程序作为所有者
});


//每一个交易都要关联最近的区块哈希，以便请求最新的区块哈希
//通过连接获取最近区块哈希,并结构
let recentBlockhash = await devconnection.getLatestBlockhash().then(res => res.blockhash);

//构建交易 
const message = new TransactionMessage({
    payerKey:wallet.publicKey,
    recentBlockhash,
    instructions:[createAccountIx],//将指令添加到数组中
}).compileToV0Message();
const tx = new VersionedTransaction(message);

//签名
tx.sign([wallet,keypair]);
console.log("sign的 tx",tx)
//通过连接将交易发送给区块链
const sig = await devconnection.sendTransaction(tx);



 