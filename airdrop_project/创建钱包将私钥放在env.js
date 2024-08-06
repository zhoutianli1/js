
import * as fs from "fs";
import base58 from 'bs58';

import{
    Keypair ,
    PublicKey,
    SystemProgram,
    Connection,
    clusterApiUrl
}from "@solana/web3.js" ;



const createWallet = async() =>
{
    try{
        const keypair = Keypair.generate() //方式2:创建钱包(密钥对)，包含一个公钥和私钥
  
        const publicKey=keypair.publicKey.toBase58() //获得公钥，转化为Base58编码
        const secretKey=keypair.secretKey.toString() //私钥打印格式，去掉空格，否则导入欢迎钱包报错
        //const secretKey = base58.encode(Keypair.secretKey)//人钥【数组型->字符串型】方式

        console.log(`公钥地址：`,publicKey)
        console.log(`私钥：`,secretKey)

        fs.writeFileSync(".env", `PRIVATE_KEY=[${keypair.secretKey.toString()}]`)

    }catch(err){
        console.error(err);
    }
}

const getWallet = async() =>
    {
        try{
            //const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") 
            const secret = process.env.PRIVATE_KEY
            console.log(`secret`,secret)
            
            
        }catch(err){
            console.error(err);
        }
    }
    

const main = async() =>{
    //创建钱包，将私钥放在env
    await createWallet() 

    //从.env 加载
    //await getWallet()
}

main()