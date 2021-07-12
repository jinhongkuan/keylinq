const Keylink = artifacts.require("Keylink");
const KeylinkDelegator = artifacts.require("KeylinkDelegator");
const CountLiquidationCheck = artifacts.require("CountLiquidationCheck");
const ERC20 = artifacts.require("ERC20");

hexToBytes = function (hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
};

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Keylink);
  await deployer.deploy(CountLiquidationCheck);

  // await deployer.deploy(KeylinkDelegator, (await Keylink.deployed()).address);

  // let countContract = await CountLiquidationCheck.deployed();
  // countContract = new web3.eth.Contract(
  //   countContract.abi,
  //   countContract.address,
  //   {
  //     gasLimit: 1000000,
  //   }
  // );

  // let keylinkContract = await Keylink.deployed();
  // keylinkContract = new web3.eth.Contract(
  //   keylinkContract.abi,
  //   keylinkContract.address,
  //   { gasLimit: 1000000 }
  // );
};
