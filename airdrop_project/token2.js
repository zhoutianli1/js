import {
    createMint,
    getOrCreateAssociatedTokenAccount,
    mintTo,
    transfer} from "@solana/spl-token";
import {getExplorerLink} from "@solana-developers/helpers";
import {
    Connection,
    clusterApiUrl,
    PublicKey,
    Transaction,
    sendAndConfirmTransaction,
    LAMPORTS_PER_SOL,
    Keypair,
  } from "@solana/web3.js";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
  
import base58 from 'bs58';


const connection = new Connection("https://devnet.helius-rpc.com/?api-key=911b0add-16e3-4ce7-a915-78590a72b5ee")

//创建密钥对（账户）：const user = getKeypairFromEnvironment("SECRET_KEY");
const user = Keypair.fromSecretKey(base58.decode('4RrFnT6xxssJDB5kVSo8fYpvADQgCe3rdH3jDP2uDdE49MFKufmtWXaaHzThigJeXuw8ZGTuxQiu8YmVdLiRug5g'))
console.log(
  `🔑 Loaded our keypair securely, using an env file! Our public key is: ${user.publicKey.toBase58()}`
);

//创建一个token结构（ 代币铸造场）：
//函数：createMint
//代币铸币厂是一个【保存特定代​​币数据】的【帐户】。
const createTokenMint = async() =>
    {
        try{
        /*
        构建代币铸造场：
            createMint函数只是创建一个包含两个指令的交易：
                创建一个新账户  
                初始化新的 mint
        */
        const tokenMint = await createMint(  //函数返回新代币铸币的公钥
            connection, 
            user, //交易付款人的公钥
            user.publicKey, //mintAuthority-被授权从代币铸造厂实际铸造代币的帐户 
            null, //freezeAuthority-有权冻结代币账户中的代币的账户。如果冻结不是所需属性，则可以将参数设置为 null
            2       //指定令牌所需的小数精度
            );   

        console.log(`✅代币铸造场的账户公钥 : ${tokenMint.toString()}`);
        //JBLf7ZiReHm6ripUUr1FLTRFVEjNDnx21DvvrZJ4VyCP

        }catch(err){
        console.error(err);
    }
}
//制作一些 token 元数据-metadata
const metadata = async() =>
    {
        try{
              const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
                "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
              );
              
              // 代币铸币账户
              const tokenMintAccount = new PublicKey("JBLf7ZiReHm6ripUUr1FLTRFVEjNDnx21DvvrZJ4VyCP");
              
              const metadataData = {
                name: "Solana Training Token",
                symbol: "TRAINING",
                // Arweave / IPFS / Pinata etc link using metaplex standard for off-chain data
                uri: "https://arweave.net/1234",
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null,
              };
              
              const metadataPDAAndBump = PublicKey.findProgramAddressSync(
                [
                  Buffer.from("metadata"),
                  TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                  tokenMintAccount.toBuffer(),
                ],
                TOKEN_METADATA_PROGRAM_ID
              );
              //const [PDA, bump] = PublicKey.findProgramAddressSync([], programId);
              //programId 用于派生 PDA 的程序 ID（地址）
              const metadataPDA = metadataPDAAndBump[0];
              
              //创建交易
              const transaction = new Transaction();
              //指令：
              const createMetadataAccountInstruction =
                createCreateMetadataAccountV3Instruction(
                  {
                    metadata: metadataPDA,
                    mint: tokenMintAccount,
                    mintAuthority: user.publicKey,
                    payer: user.publicKey,
                    updateAuthority: user.publicKey,
                  },
                  {
                    createMetadataAccountArgsV3: {
                      collectionDetails: null,
                      data: metadataData,
                      isMutable: true,
                    },
                  }
                );
              
              transaction.add(createMetadataAccountInstruction);
               //添加所有指令后，需要将交易发送到集群并确认：
              const transactionSignature = await sendAndConfirmTransaction(
                connection,
                transaction,
                [user]
              );
              
              const transactionLink = getExplorerLink(
                "transaction",
                transactionSignature,
                "devnet"
              );
              
              console.log(`✅ Transaction confirmed, explorer link is: ${transactionLink}!`);
              
              const tokenMintLink = getExplorerLink(
                "address",
                tokenMintAccount.toString(),
                "devnet"
              );
              
              console.log(`✅ Look at the token mint again: ${tokenMintLink}!`);
        }catch(err){
        console.error(err);
    }
    //您现在将看到 Solana Explorer 已更新，并在铸币厂上显示代币的名称和符号！
}


//您需要一个代币账户来持有新发行的代币。创建关联代币账户来存储代币
//代币账户持有特定“铸币”的代币，并有指定的账户“所有者”。只有所有者才有权减少代币账户余额（转移、销毁等），而任何人都可以向代币账户发送代币以增加其余额。
//函数：getOrCreateAssociatedTokenAccount
const CreateAssociatedTokenAccount = async() =>
    {
        try{
              const tokenMintAccount = new PublicKey("JBLf7ZiReHm6ripUUr1FLTRFVEjNDnx21DvvrZJ4VyCP");
              
              //请求空头
              await connection.requestAirdrop(user.publicKey,2*LAMPORTS_PER_SOL);
             
              //在这里，我们正在为我们自己的地址创建一个关联的令牌帐户，但我们可以
              //在devnet中的任何其他钱包上制作ATA！
              
              const recipient = user.publicKey;
              
              //创建一个【关联代币账户】:
              //获取关联代币账户时使用getOrCreateAssociatedTokenAccount来确保他们的代币账户在转账前存在。
              //如果该账户尚不存在，则此函数将创建该账户
              const tokenAccount = await getOrCreateAssociatedTokenAccount(
                connection,   //
                user,               //交易付款人的账户
                tokenMintAccount,  //代币铸造工程 地址
                recipient           //代币账户所有者的账户
              );
              
              console.log(`Token Account: ${tokenAccount.address.toBase58()}`);
              //代币账户Token Account: 284Gmr867NeT3uJFvPSNEF6M5PZ4Cjmmt6RTEYrEGY2b
            
              const link = getExplorerLink(
                "address",
                tokenAccount.address.toBase58(),
                "devnet"
              );
              
              console.log(`✅ Created token Account成功: ${link}`);
        }catch(err){
        console.error(err);
    }
}

//4. 铸造代币，现在我们有了代币铸造厂和代币账户，让我们将代币铸造到代币账户。
const Token = async() =>
  {
      try{
        // 我们的代币有两位小数
        const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);//10*10


        //代币铸币厂帐户
        const tokenMintAccount = new PublicKey("JBLf7ZiReHm6ripUUr1FLTRFVEjNDnx21DvvrZJ4VyCP");
              

        // token account 
        const recipientAssociatedTokenAccount = new PublicKey("284Gmr867NeT3uJFvPSNEF6M5PZ4Cjmmt6RTEYrEGY2b");
        
        const transactionSignature = await mintTo(
          connection,
          user,         //交易付款人的账户
          tokenMintAccount,//   代币铸币厂
          recipientAssociatedTokenAccount,//代币将被铸造到的【代币账户】，它的拥有者是user
          user,   //-被授权铸造代币的账户（在第一个函数中被授权从代币铸造厂实际铸造代币的帐户） 
          10 * MINOR_UNITS_PER_MAJOR_UNITS//要铸造的代币的原始数量
        );

        const link = getExplorerLink("transaction", transactionSignature, "devnet");
      //https://explorer.solana.com/tx/26gNzLfxfd3ZBUzGgCc1eYg4qndX5a7PyWTTXHwWMdJhiicPhNMu1KY5Px4ZPJkg1v6K9LvmoArXGaFPfN9kpuwu?cluster=devnet
        console.log(`✅ 成功，将代币铸造到代币账户。: ${link}`);
        
      }catch(err){
      console.error(err);
  }
}

//5.转移代币。接下来，让我们使用【spl-token】库的transfer函数转移一些我们刚刚铸造的代币。
const giveToken = async() =>
  {
      try{
        //代币目前位于与我们的钱包关联的关联代币账户中。我们不必记住关联代币账户的地址 - 我们只需使用getOrCreateAssociatedTokenAccount()查找它
        //并提供我们的地址
        //和我们要发送的代币的铸币厂即可


        const sender = user; //拥有代币的 钱包账户


        // 钱包地址：test1
        const recipient = new PublicKey("2qwEEhWKVBfYae5JxKFr7ExtAWf5QyuaMTuBF7qLxcEB");

        // 代币铸造厂
        const tokenMintAccount = new PublicKey("JBLf7ZiReHm6ripUUr1FLTRFVEjNDnx21DvvrZJ4VyCP");

        // Our token has two decimal places
        const MINOR_UNITS_PER_MAJOR_UNITS = Math.pow(10, 2);


        //获取关联代币账户时使用getOrCreateAssociatedTokenAccount来确保他们的代币账户在转账前存在。
        //如果该账户尚不存在，则此函数将创建该账户
        const sourceTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          sender,
          tokenMintAccount,
          sender.publicKey //代币账户所有者的账户
        );

        //账户尚不存在，创建了该账户
        const destinationTokenAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          sender,//交易付款人的账户
          tokenMintAccount,//新代币账户所关联的代币铸币厂
          recipient    //代币账户所有者的账户
        );

        // Transfer the tokens
        const signature = await transfer(
          connection,
          sender,//交易付款人的账户
          sourceTokenAccount.address, //发送代币的代币账户
          destinationTokenAccount.address,//接收代币的代币账户
          sender,//源代币账户所有者的账户-test2
          1 * MINOR_UNITS_PER_MAJOR_UNITS
        );

        const explorerLink = getExplorerLink("transaction", signature, "devnet");

        console.log(`✅ Transaction confirmed, explorer link is: ${explorerLink}!`);
//https://explorer.solana.com/tx/4eSmNYJqgyKzK37dpQaWCVU2YeE17vYRiZjRw3G3XJvbBzB94zrKBQj3Ypq6rceD87ppjoBgrBYfaSdgeKFWL4Eb?cluster=devnet!
      }catch(err){
      console.error(err);
  }
}
const main = async() =>{  
    //createTokenMint() 已完成 创造代币本身
    //metadata() 失败
    //CreateAssociatedTokenAccount() 已完成 创造一个代币账户来持有新发行的代币。
    //Token()  铸造代币，现在我们有了代币铸造厂和代币账户，让我们将代币铸造到代币账户。
    //giveToken() //完成
}

main()