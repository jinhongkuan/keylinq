var Collaterize = artifacts.require("Collaterize");
var TimeLiquidationCheck = artifacts.require("TimeLiquidationCheck");

hexToBytes = function (hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
};

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Collaterize);
  await deployer.deploy(TimeLiquidationCheck);
  let tlcContract = await TimeLiquidationCheck.deployed();
  tlcContract = new web3.eth.Contract(tlcContract.abi, tlcContract.address, {
    gasLimit: 1000000,
  });
  let collaterizeContract = await Collaterize.deployed();
  collaterizeContract = new web3.eth.Contract(
    collaterizeContract.abi,
    collaterizeContract.address,
    { gasLimit: 1000000 }
  );

  await collaterizeContract.methods
    .createCollateralETH(
      accounts[1],
      tlcContract.options.address,
      web3.utils.numberToHex(Math.ceil(Date.now() / 1000) + 60)
    )
    .send({ from: accounts[0], value: web3.utils.toWei("1", "ether") });
};
