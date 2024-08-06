/*
我们将创建一个脚本来 ping 一个链上程序，
    该程序在每次 ping 时都会增加一个计数器。
    该程序位于 Solana Devnet 的地址: ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa上 。
    该程序将其数据存储在地址: Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod的特定帐户中 。
*/
import base58 from 'bs58';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const{
    Connection, //用于连接solana
    PublicKey,  //模块化处理公钥
    TransactionInstruction,
    Keypair,
    LAMPORTS_PER_SOL, //一个固定常量，一个solana可以兑换10亿个Lamports
    Transaction,
    sendAndConfirmTransaction,

}=require("@solana/web3.js")//等价于：import Keypair from "@solana/web3.js" 

//利用私钥创建钱包（账户2:）：4RrFnT6xxssJDB5kVSo8fYpvADQgCe3rdH3jDP2uDdE49MFKufmtWXaaHzThigJeXuw8ZGTuxQiu8YmVdLiRug5g
const payer = Keypair.fromSecretKey(base58.decode('4RrFnT6xxssJDB5kVSo8fYpvADQgCe3rdH3jDP2uDdE49MFKufmtWXaaHzThigJeXuw8ZGTuxQiu8YmVdLiRug5g'))
const connection = new Connection("https://devnet.helius-rpc.com/?api-key=911b0add-16e3-4ce7-a915-78590a72b5ee")
//这将连接到 Solana Devnet 并在需要时请求一些测试 Lamport。
const fromAirDropSingature = await connection.requestAirdrop(payer.publicKey,2*LAMPORTS_PER_SOL)

const PING_PROGRAM_ADDRESS = new PublicKey('ChT1B39WKLS8qUrkLvFDXMhEJ4F1XZzwUNHUt4AU9aVa')
const PING_PROGRAM_DATA_ADDRESS =  new PublicKey('Ah9K7dQ8EHaZqcAsgBW8w37yN2eAy3koFmUn4x3CJtod')
        
//1创建一个新的交易，2然后为程序账户初始化一个PublicKey ，3为数据账户初始化另一个PublicKey。
const transaction = new Transaction()
const programId = new PublicKey(PING_PROGRAM_ADDRESS)
const pingProgramDataId = new PublicKey(PING_PROGRAM_DATA_ADDRESS) //数据账户

//自定义指令：

const instruction = new TransactionInstruction({
  keys: [  //包含一个数组keys:其中包含将读取或写入的所有帐户-上面引用的数据帐户;
    {
      pubkey: pingProgramDataId,
      isSigner: false,   //一个布尔值，表示该账户是否是交易的签名者
      isWritable: true   //一个布尔值，表示在交易执行期间是否写入帐户
    },
  ],
  programId//包含 Ping 程序的公钥：programId
})

//接下来，让我们将此指令添加到我们创建的交易中。
transaction.add(instruction)

//然后，通过传入连接、交易和付款人来调用sendAndConfirmTransaction()。
const signature = await sendAndConfirmTransaction(
  connection,
  transaction,
  [payer]
)

//输入：npx esrun ping.js   或者node ping.js  
//esrun是esbuild 的薄包装器，可以几乎立即编译 Typescript。
//npm（node 包管理器）是安装 Node.js 时随附的依赖项/包管理器
//从 npm 版本5.2.0开始，npx 已与 npm 预捆绑。因此，它现在几乎已成为标准。npx也是一个 CLI 工具，其目的是轻松安装和管理托管在 npm 注册表中的依赖项。
console.log(`✅ 交易完成 ${signature}`)