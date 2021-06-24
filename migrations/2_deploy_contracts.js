var Collaterize = artifacts.require("Collaterize");
var CountLiquidationCheck = artifacts.require("CountLiquidationCheck");

hexToBytes = function (hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
};

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Collaterize);
  await deployer.deploy(CountLiquidationCheck);
  let countContract = await CountLiquidationCheck.deployed();
  countContract = new web3.eth.Contract(
    countContract.abi,
    countContract.address,
    {
      gasLimit: 1000000,
    }
  );
  let collaterizeContract = await Collaterize.deployed();
  collaterizeContract = new web3.eth.Contract(
    collaterizeContract.abi,
    collaterizeContract.address,
    { gasLimit: 1000000 }
  );

  // let response = await collaterizeContract.methods
  //   .createCollateralETH(
  //     2,
  //     "Commissioned sculpture",
  //     countContract.options.address,
  //     2
  //   )
  //   .send({ from: accounts[0], value: web3.utils.toWei("0.03", "ether") });

  // let id = response.events.Created.returnValues.id;

  // await collaterizeContract.methods.transfer(accounts[1], id, 1);
};
