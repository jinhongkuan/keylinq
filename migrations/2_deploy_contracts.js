const Keylinq = artifacts.require("Keylinq");
const KeylinqProxy = artifacts.require("KeylinqProxy");
const KeylinkDelegator = artifacts.require("KeylinkDelegator");
const CountLiquidationCheck = artifacts.require("CountLiquidationCheck");
const ERC20 = artifacts.require("ERC20");

hexToBytes = function (hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
};

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Keylinq);
  await deployer.deploy(KeylinqProxy);
  await deployer.deploy(CountLiquidationCheck);

  let keylinq = await Keylinq.deployed();
  let proxy = await KeylinqProxy.deployed();
  let countContract = await CountLiquidationCheck.deployed();
  await proxy.upgrade(keylinq.address);
};
