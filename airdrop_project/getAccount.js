import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { clusterApiUrl, Connection } from "@solana/web3.js";
/*
获取程序的【token】帐户：
  一个返回【程序】所拥有的账户的RPC方法。目前不支持分页。
  请求getProgramAccounts应该包括dataSlice和/或filters参数，以提高响应时间并返回只有预期结果的内容。

  参数：
    programId: string - 要查询的程序的公钥，以base58编码的字符串形式提供。
#
*/
(async () => {
  const MY_WALLET_ADDRESS = "6ggrda5uzAj4XHjmewGQYMdZxKSc2AgsnLNZndWsqfLJ";//本地钱包公钥: 6ggrda5uzAj4XHjmewGQYMdZxKSc2AgsnLNZndWsqfLJ
  //const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const connection = new Connection("https://devnet.helius-rpc.com/?api-key=911b0add-16e3-4ce7-a915-78590a72b5ee")


  const accounts = await connection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID, // new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    {
      filters: [
        {
          dataSize: 165, // 在Token程序的情况下，我们可以看到代币账户的长度为165个字节我们可以在filters数组中添加{ dataSize: 165 }来将查询范围缩小为仅限长度为165个字节的账户
        },
        {
          memcmp: {//我们还需要添加一个过滤器来查找由我们的地址拥有的账户。memcmp过滤器，也叫"内存比较"过滤器
            offset: 32, //offset: 开始比较数据的位置。这个位置以字节为单位，表示为一个整数。
                        //我们可以修改查询，只返回由我们的钱包地址拥有的代币账户
                        //观察代币账户时，我们可以看到存储在代币账户上的前两个字段都是公钥，而且每个公钥的长度为32个字节。鉴于owner是第二个字段，我们应该从offset为32字节的位置开始进行
            bytes: MY_WALLET_ADDRESS, // bytes: 数据应该与账户的数据匹配。这表示为一个base58编码的字符串，应该限制在129个字节以下。
          },
        },
      ],
    }
  );

  console.log(
    `Found ${accounts.length} token account(s) for wallet ${MY_WALLET_ADDRESS}: `
  );
  accounts.forEach((account, i) => {
    console.log(
      `-- Token Account Address ${i + 1}: ${account.pubkey.toString()} --`
    );
    console.log(`Mint: ${account.account.data["parsed"]["info"]["mint"]}`);
    console.log(
      `Amount: ${account.account.data["parsed"]["info"]["tokenAmount"]["uiAmount"]}`
    );
  });
//输出： 本地钱包有 2个 token
//spl-token balance 6K3aMMQviCoGPXCmu4ixarBrTFegVH4bFYTwtpN15vuP --url devnet ；输出代币数量：0
//spl-token balance 2buMVoo3qnDxhg6rHpWrPZdMEzvDTcuuQf3XwvZqzoBr --url devnet ；输出代币数量：900

})();