async function deployContract() {
  const ArtItem = await ethers.getContractFactory("ArtItem");
  const art = await ArtItem.deploy();

  await art.deployed();

  console.log("Art deployed to:", art.address);
}

deployContract()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });