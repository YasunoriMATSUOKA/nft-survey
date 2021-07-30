const { ethers } = require("ethers");

// ローカルでテストした際等に.solファイルを元にコンパイルされて生成されるコントラクトの情報をすべて持つjsonファイル
const contractData = require("../artifacts/contracts/NFT.sol/NFT.json");
const abi = contractData.abi;
const bytecode = contractData.bytecode;

const chainIdToEtherscanPrefix = (chainId) => {
  switch (chainId) {
    case 1:
      return "";
    case 3:
      return "ropsten.";
    case 4:
      return "rinkeby.";
    case 5:
      return "goerli.";
    case 42:
      return "kovan.";
    default:
      return null;
  }
}

(async () => {
  // deploy contract
  // Ethereumの場合
  const provider = ethers.getDefaultProvider("rinkeby", {infura: process.env.INFURA_PROJECT_ID});
  // Polygon Mumbai Testnetの場合
  // const provider = new ethers.providers.JsonRpcProvider(`https://polygon-mumbai.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  // デプロイ前にこれからデプロイするためのコントラクトを構成する場合
  const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
  console.log("deploy contract");
  const contract = await contractFactory.deploy();
  console.log("hash", contract.deployTransaction.hash);
  const contractAddress = contract.address;
  console.log("contractAddress", contractAddress);
  const network = await provider.getNetwork();
  const etherscanPrefix = chainIdToEtherscanPrefix(network.chainId);
  if (etherscanPrefix) {
    console.log(`https://${etherscanPrefix}etherscan.io/tx/${contract.deployTransaction.hash}`);
  }
  await contract.deployTransaction.wait([confirms = 1]);
  console.log("deploy transaction confirmed");

  // デプロイ後にデプロイ済のコントラクトを使用する場合
  const deployedContract = new ethers.Contract(contractAddress, abi, provider);
  
  console.log("name", await deployedContract.name());
  console.log("symbol", await deployedContract.symbol());
  console.log("totalSupply", await deployedContract.totalSupply());
  console.log("balanceOf", await deployedContract.balanceOf(await wallet.getAddress()));

  console.log("mint 0");
  const mint0Transaction = await deployedContract.connect(wallet).mint(await wallet.getAddress())
  console.log("hash", mint0Transaction.hash);
  if (etherscanPrefix) {
    console.log(`https://${etherscanPrefix}etherscan.io/tx/${mint0Transaction.hash}`);
  }
  await mint0Transaction.wait([confirms = 1]);
  console.log("mint 0 transaction confirmed");

  const balanceOfMinter = await deployedContract.balanceOf(await wallet.getAddress());
  console.log("balanceOfMinter", balanceOfMinter);

  const ownerOf0 = await deployedContract.connect(wallet).ownerOf(0);
  console.log("ownerAddress", ownerOf0);

  console.log("send from minter to another address");
  const toAddress = "0x5C51CF1e435973E76834279944e4bA46438f12aa";
  const transferFromTransaction = await deployedContract.connect(wallet).transferFrom(await wallet.getAddress(), toAddress, 0);
  console.log("hash", transferFromTransaction.hash);
  if (etherscanPrefix) {
    console.log(`https://${etherscanPrefix}etherscan.io/tx/${transferFromTransaction.hash}`);
  }
  await transferFromTransaction.wait([confirms = 1]);
  console.log("ownerAddress", await deployedContract.connect(wallet).ownerOf(0));
})();
