//
import{
     Keypair ,
     PublicKey,
     SystemProgram,
     Connection,
     clusterApiUrl
}from "@solana/web3.js" ;

import{
    MINT_SIZE,
    TOKEN_PROGRAM_ID,
    createAccount,
    createInitializeAccount2Instruction,
    createAmountToUiAmountInstruction,
    createMint,
    mintTo,
    createInitializeMint2Instruction,
}from "@solana/spl-token" ;

import{
    TOKEN_PROGRAM_ID as METADATA_PROGRAM_ID,
    createCreateMetadataAccountV3Instruction,
    
}from "@metaplex-founfation/mpl-token-metadata" //用于处理token元数据

//利用账户2"私钥"创建钱包：4RrFnT6xxssJDB5kVSo8fYpvADQgCe3rdH3jDP2uDdE49MFKufmtWXaaHzThigJeXuw8ZGTuxQiu8YmVdLiRug5g
const wallet = Keypair.fromSecretKey(base58.decode('4RrFnT6xxssJDB5kVSo8fYpvADQgCe3rdH3jDP2uDdE49MFKufmtWXaaHzThigJeXuw8ZGTuxQiu8YmVdLiRug5g'))
const publicKey_ = wallet.publicKey.toBase58() //公钥【数组型->字符串型】方式
const secretKey = base58.encode(wallet.secretKey)//人钥【数组型->字符串型】方式

const  test = new PublicKey("6ggrda5uzAj4XHjmewGQYMdZxKSc2AgsnLNZndWsqfLJ")

const devconnection = new Connection("https://devnet.helius-rpc.com/?api-key=911b0add-16e3-4ce7-a915-78590a72b5ee")

//新建一个钱包
const keypair = Keypair.generate()

//创建token的配置信息
const tokenConfig = {
    decimal:2, //小数位
    name:"Seven Seas Gold",
    symbol:"GOLD",
    url:"https://thisisnot.arealurl/info.json",
}

//指令1:在链上创建账户
const createMintAccountInstruction = SystemProgram.createAccount({
    fromPubkey:wallet.publicKey,
    newAccountPubkey:keypair.publicKey,
    lamports:await devconnection.getMinimumBalanceForRentExemption(),
    space:MINT_SIZE,
    programId:TOKEN_PROGRAM_ID,//使用系统程序作为所有者
});

//2初始化账户，让它 被Token程序知道用来 铸造
const initializeMintInstruction = createInitializeMint2Instruction(
    keypair.publicKey, //铸造账户地址
    tokenConfig.decimal,
    wallet.publicKey,//交易付款人
    wallet.publicKey,//铸造权威 和 冻结权威的所有者 
)

//在链上保存Token元数据的 元数据账户地址
const metadataAccount = PublicKey.findProgramAddressSync(
    [Buffer.from("metadata"),METADATA_PROGRAM_ID.toBuffer(),keypair.publicKey.toBuffer()],
    METADATA_PROGRAM_ID,
)[0];

console.log("元数据账户地址",metadataAccount.toBase58())

//链上创建【3.元数据账户】
