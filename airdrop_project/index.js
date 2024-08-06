
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
    sendAndConfirmTransaction,
    TransactionMessage,
    VersionedTransaction
}=require("@solana/web3.js")//等价于：import Keypair from "@solana/web3.js" 

//方式1:利用私钥创建钱包（账户2:）：4RrFnT6xxssJDB5kVSo8fYpvADQgCe3rdH3jDP2uDdE49MFKufmtWXaaHzThigJeXuw8ZGTuxQiu8YmVdLiRug5g
const wallet = Keypair.fromSecretKey(base58.decode('4RrFnT6xxssJDB5kVSo8fYpvADQgCe3rdH3jDP2uDdE49MFKufmtWXaaHzThigJeXuw8ZGTuxQiu8YmVdLiRug5g'))


//console.log(`钱包（未解码的）：`,wallet)

//获取钱包凭证：（包含一个公钥和私钥）
const publicKey_ = wallet.publicKey.toBase58() //公钥【数组型->字符串型】方式
const publicKey = new PublicKey(publicKey_)

//const secretKey = wallet.secretKey.toString()
const secretKey = base58.encode(wallet.secretKey)//人钥【数组型->字符串型】方式

console.log(`公钥地址：`,publicKey_)
console.log(`私钥：`,secretKey)
/*
const keypair = Keypair.generate() //方式2:创建钱包，包含一个公钥和私钥
console.log(`钱包（未解码的）：`,keypair)
const publicKey=keypair.publicKey.toBase58() //获得公钥，转化为Base58编码
const secretKey=keypair.secretKey.toString() //私钥打印格式，去掉空格，否则导入欢迎钱包报错
console.log(`公钥地址：`,publicKey)
console.log(`私钥：`,secretKey)

Solana 上存储的所有数据都存储在帐户中。帐户可以存储：

索尔
其他代币，例如 USDC
NFT
程序，就像我们在本课程中制作的电影评论程序！
节目数据，如上述节目的电影评论！
*/



//从devnet网络 【读取数据】：例如查询账户余额
const getWalletBalance = async() =>
{
    try{
        //创建连接对象,连接到dev
        const devconnection = new Connection("https://devnet.helius-rpc.com/?api-key=911b0add-16e3-4ce7-a915-78590a72b5ee")
        //连不上：const devconnection = new Connection("https://api.devnet.solana.com", "confirmed");
        //连不上：const devconnection = new Connection(clusterApiUrl("devnet"));
        console.log(`连接对象：${devconnection}`)
        //test1获取余额：
        //通过公钥查余额; test1的公钥：2qwEEhWKVBfYae5JxKFr7ExtAWf5QyuaMTuBF7qLxcEB
        const walletBalance = await devconnection.getBalance(new PublicKey("2qwEEhWKVBfYae5JxKFr7ExtAWf5QyuaMTuBF7qLxcEB")) 
        console.log(`账户test1余额：${walletBalance}`)
        const blanceSOL = walletBalance/LAMPORTS_PER_SOL
        console.log(`账户test1余额对应SQL数量：${blanceSOL}`)
        
        //项目新建的钱包余额
        const walletBalanceNew = await devconnection.getBalance(publicKey) 
        console.log(`账户test2的钱包SQL数量：${walletBalanceNew/LAMPORTS_PER_SOL}`

        )
    } catch(err){
        console.error(err);
    }
}


//向钱包test2发送solana货币
const airDropSql = async() =>
{
    try{
        //创建连接对象
        const devconnection = new Connection("https://devnet.helius-rpc.com/?api-key=911b0add-16e3-4ce7-a915-78590a72b5ee")
        //发送SOL
        const fromAirDropSingature = await devconnection.requestAirdrop(new PublicKey("2qwEEhWKVBfYae5JxKFr7ExtAWf5QyuaMTuBF7qLxcEB"),2*LAMPORTS_PER_SOL)
        
        const walletBalance = await devconnection.getBalance(new PublicKey("2qwEEhWKVBfYae5JxKFr7ExtAWf5QyuaMTuBF7qLxcEB")) 
        console.log(`test1余额：${walletBalance}`)
    } catch(err){
        console.error(err);
    }
}

//将数据写入网络（需要进行交易）：例子：在新建的钱包 和 test1钱包之间 进行转账
//对链上数据的所有修改都是通过【交易】进行的 ，它是原子的，交易包含一系列指令，原子性意味着要么指令发生（即所有单独的步骤都成功），要么整个事务失败。
const tran = async() =>
{
    try{
        //接收和发送地址
        const add = publicKey
        const to = new PublicKey("2qwEEhWKVBfYae5JxKFr7ExtAWf5QyuaMTuBF7qLxcEB")

        //创建连接对象
        const devconnection = new Connection("https://devnet.helius-rpc.com/?api-key=911b0add-16e3-4ce7-a915-78590a72b5ee")

        //交易前余额
        // const walletBalanceAdd = await devconnection.getBalance(add) 
        // console.log(`交易前add的钱包余额:${walletBalanceAdd}`)
        // const walletBalanceTo = await devconnection.getBalance(to) 
        // console.log(`交易前to的钱包余额:${walletBalanceTo}`)

        //创建 交易
        const transaction = new Transaction()
        //构建指令
        const send  = SystemProgram.transfer(
            {
                fromPubkey: add,
                toPubkey: to,
                lamports:100000000 //一个SOL
            }
        );
        transaction.add(send);

        //添加所有指令后，需要将交易发送到集群并确认：
        /*
        sendAndConfirmTransaction ()函数采用以下参数：
            集群连接
            交易
            一组密钥对，将作为交易的签名者 - 在这个例子中，我们只有一个签名者：发送者。
        */
        let sig = await sendAndConfirmTransaction(devconnection,transaction,[
            wallet,
        ]);
        //区块链上的所有交易都可以在Solana Explorer上公开查看。获取sendAndConfirmTransaction()返回的签名，在 Solana Explorer 中搜索该签名，然后查看：
        console.log(`本次交易签名sig：${sig}`)
        //交易后余额
        const walletBalanceAdd2 = await devconnection.getBalance(add) 
        console.log(`交易后add的钱包余额：${walletBalanceAdd2}`)
        const walletBalanceTo2 = await devconnection.getBalance(to) 
        console.log(`交易后to的钱包余额：${walletBalanceTo2}`)

    } catch(err){
        console.error(err);
    }
}

const tran2 = async() =>
    {
        try{
            //接收和发送地址
            const add = wallet.publicKey
            const to = new PublicKey("2qwEEhWKVBfYae5JxKFr7ExtAWf5QyuaMTuBF7qLxcEB")
    
            //创建连接对象
            const devconnection = new Connection("https://devnet.helius-rpc.com/?api-key=911b0add-16e3-4ce7-a915-78590a72b5ee")
    
            //定义分配的空间，这个例子中不需要分配额外空间，
            const space = 0;
            //押金：请求0字节的最小免租金 小数SOL的小额支付，这被称为lamports,价值是0.000000001 SOL。
            const lamports = await devconnection.getMinimumBalanceForRentExemption(space)
             //指令1：转账 .transfer
            const createAccountIx = SystemProgram.transfer({
                                        lamports:100000000,
                                        fromPubkey:add, //账户1
                                        toPubkey:to, //新建的钱包
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

            //签名,需要传入签名者的密钥对以及您正在创建的帐户的密钥对。
            tx.sign([wallet]);

            //通过连接将交易发送给区块链
            const sig = await devconnection.sendTransaction(tx);

            //交易后余额
            const walletBalanceAdd2 = await devconnection.getBalance(add) 
            console.log(`交易后add的钱包余额：${walletBalanceAdd2}`)
            const walletBalanceTo2 = await devconnection.getBalance(to) 
            console.log(`交易后to的钱包余额：${walletBalanceTo2}`)
    
        } catch(err){
            console.error(err);
    }
}

const main = async() =>{
    //await getWalletBalance()
    //await airDropSql()
    await tran()
    //await tran2()
}

main()