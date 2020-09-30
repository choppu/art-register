async function deployContract() {
  const baseUrl = 'http://127.0.0.1:5001';
  const ArtItem = await ethers.getContractFactory("ArtItem");
  const art = await ArtItem.deploy();
  await art.deployed();
  await art.setBaseURL(baseUrl);

  console.log("Art deployed to:", art.address);
}

deployContract()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });