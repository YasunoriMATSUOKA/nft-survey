const { ethers } = require("ethers");

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
    case 42:
      return "kovan.";
    default:
      return null;
  }
}

// deploy contract
(async () => {
  const provider = ethers.getDefaultProvider("rinkeby", {infura: process.env.INFURA_PROJECT_ID});
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  const contractFactory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await contractFactory.deploy();
  console.log("hash", contract.deployTransaction.hash);
  const contractAddress = contract.address;
  console.log("contractAddress", contractAddress);
  const network = await provider.getNetwork();
  const etherscanPrefix = chainIdToEtherscanPrefix(network.chainId);
  if (etherscanPrefix) {
    console.log(`https://${etherscanPrefix}etherscan.io/tx/${contract.deployTransaction.hash}`);
  }
  const waitTransaction1Confirmed = await contract.deployTransaction.wait([confirms = 1]);
  console.log("transaction1Confirmed", waitTransaction1Confirmed);
})();
