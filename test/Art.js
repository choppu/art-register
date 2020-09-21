const { expect } = require("chai");
const { ethers } = require("@nomiclabs/buidler");

describe("Art contract", () => {
  let art;
  let owner;

  let baseUrl = 'http://127.0.0.1:5001';
  let cid = "QmWXdjNC362aPDtwHPUE9o2VMqPeNeCQuTBTv1NsKtwypg";

  before(async () =>{
    const Art = await ethers.getContractFactory("ArtItem");
    [owner, ...addrs] = await ethers.getSigners();
    artContract = await Art.deploy();
    await artContract.deployed();
  });

  it("Create Art", async () => {
    let artId = await artContract.createArt.call(baseUrl, cid);
    console.log(artId);
    expect(artContract.tokenURI(0)).to.equal(cid);
  });
});