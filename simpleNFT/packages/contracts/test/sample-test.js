const { expect } = require("chai");
describe("NFT", function() {
  it("NFT basic test", async function() {
    const [signer, badSigner] = await ethers.getSigners();
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy();
    await nft.deployed();
    expect(await nft.name()).to.equal("NFT Survey Proto");
    expect(await nft.symbol()).to.equal("NFTSP");
    const nftMint0Result = await nft.mint(signer.address);
    console.log("nftMint0Result", nftMint0Result);
    expect(await nft.balanceOf(signer.address)).to.equal(1);
    await expect(nft.connect(badSigner).mint(signer.address)).to.revertedWith("ERC721PresetMinterPauserAutoId: must have minter role to mint");
    expect(await nft.tokenURI(0)).to.equal("https://asia-northeast1-nft-survey.cloudfunctions.net/api/v1/tokens/0");
    const nftMint1Result = await nft.mint(signer.address);
    console.log("nftMint1Result", nftMint1Result);
    expect(await nft.balanceOf(signer.address)).to.equal(2);
    expect(await nft.tokenURI(1)).to.equal("https://asia-northeast1-nft-survey.cloudfunctions.net/api/v1/tokens/1")
    const pauseResult = await nft.connect(signer).pause();
    console.log(pauseResult);
    const unpauseResult = await nft.connect(signer).unpause();
    console.log(unpauseResult);
    const burnResult = await nft.connect(signer).burn(1);
    console.log(burnResult);
    expect(await nft.balanceOf(signer.address)).to.equal(1);
    const transferFromResult = await nft.connect(signer).transferFrom(signer.address, "0x70997970c51812dc3a010c7d01b50e0d17dc79c8", 0);
    console.log(transferFromResult);
    expect(await nft.balanceOf("0x70997970c51812dc3a010c7d01b50e0d17dc79c8")).to.equal(1);
  });
});