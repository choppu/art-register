const { expect } = require("chai");
const { ethers } = require("@nomiclabs/buidler");

describe("Art contract", () => {
  let artID;
  let authorAddress;
  let newOwnerAddress;

  let baseUrl = 'http://127.0.0.1:5001/';
  let cid = "QmWXdjNC362aPDtwHPUE9o2VMqPeNeCQuTBTv1NsKtwypg";

  before(async () =>{
    const Art = await ethers.getContractFactory("ArtItem");
    [owner, author, newOwner, ...addrs] = await ethers.getSigners();
    artContract = await Art.deploy();
    await artContract.deployed();

    authorAddress = await author.getAddress();
    newOwnerAddress = await newOwner.getAddress();
  });
  it("Only owner can set baseURI", async() => {
    artContract.setBaseURL(baseUrl);
    expect(await artContract.baseURI()).to.equal(baseUrl);
    await expect(artContract.connect(author).setBaseURL(baseUrl)).to.be.revertedWith("Ownable: caller is not the owner");
  });
  it("Create Art and assigns it to owner", async () => {
    let receipt = await (await artContract.connect(author).createArt(cid)).wait();
    let artEvent = receipt.events.pop();
    expect(artEvent.event).to.equal('Art');
    expect(artEvent.eventSignature).to.equal('Art(uint256)');
    artID = artEvent.args[0];
    expect(await artContract.balanceOf(authorAddress)).to.equal(1);
  });
  it("Create Art with correct tokenURI", async () => {
    expect(await artContract.tokenURI(artID)).to.equal(baseUrl + cid);
  });
  it("Transfers coin from author to newOwner", async () => {
    await artContract.connect(author).transferFrom(authorAddress, newOwnerAddress, artID);
    expect(await artContract.balanceOf(authorAddress)).to.equal(0);
    expect(await artContract.balanceOf(newOwnerAddress)).to.equal(1);
  });
  it("Emits Art event", async () => {
    await expect(artContract.connect(author).createArt(cid)).to.emit(artContract, "Art");
  });
});