const hre = require('hardhat');

// return address balance
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// print balances for a list of addresses \
async function printBalances(addresses) {
  let idx = 0;
  for (const addr of addresses){
    const balance = await getBalance(addr);
    console.log(`address ${idx} balance: ${balance}`);
    idx++;
  }
}

async function main() {
  // generate some address for test
  const [owner, tipper1, tipper2, tipper3] = await hre.ethers.getSigners();

  // deploy contract on hardhat
  const BuyMeACoffee = await hre.ethers.getContractFactory('BuyMeACoffee');
  const buyMeACoffee = await BuyMeACoffee.deploy();

  // check contract address
  await buyMeACoffee.deployed();
  console.log("buyMeACoffee contract deployed on: ", buyMeACoffee.address);

  // check balance before started
  const addresses = [owner.address, tipper1.address, buyMeACoffee.address];
  console.log("====START====");
  await printBalances(addresses);

  // buy coffee test
  const tip = {value: hre.ethers.utils.parseEther("1")};
  await buyMeACoffee.connect(tipper1).buyCoffee('Jim', 'good job, continue', tip);
  await buyMeACoffee.connect(tipper2).buyCoffee('Cat', 'meow', tip);
  await buyMeACoffee.connect(tipper3).buyCoffee('Kim', 'I love it!', tip);

  // check the result
  console.log("====bought coffee====");
  await printBalances(addresses);

  // change owner
  await buyMeACoffee.connect(owner).updateOwner(tipper1.address);

  // Withdraw
  await buyMeACoffee.connect(tipper1).withdraw();

  console.log("====after withdraw====");
  await printBalances(addresses);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
