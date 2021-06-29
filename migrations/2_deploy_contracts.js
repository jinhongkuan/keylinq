const Collaterize = artifacts.require("Collaterize");
const CountLiquidationCheck = artifacts.require("CountLiquidationCheck");
const ERC20 = artifacts.require("ERC20");

hexToBytes = function (hex) {
  for (var bytes = [], c = 0; c < hex.length; c += 2)
    bytes.push(parseInt(hex.substr(c, 2), 16));
  return bytes;
};

module.exports = async function (deployer, network, accounts) {
  await deployer.deploy(Collaterize);
  await deployer.deploy(CountLiquidationCheck);
  await deployer.deploy(
    ERC20,
    "TestERC20",
    "TERC",
    new web3.utils.BN("100000000000000000000")
  );

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

  let ERC20Contract = await ERC20.deployed();
  ERC20Contract = new web3.eth.Contract(
    ERC20Contract.abi,
    ERC20Contract.address,
    { gasLimit: 1000000 }
  );
  await ERC20Contract.methods
    .approve(collaterizeContract.options.address, 1000)
    .send({ from: accounts[0] });

  let response = await collaterizeContract.methods
    .createCollateralERC20(
      ERC20Contract.options.address,
      1000,
      2,
      "Commissioned sculpture",
      countContract.options.address,
      2
    )
    .send({ from: accounts[0] });

  // let id = response.events.Created.returnValues.id;

  // await collaterizeContract.methods.transfer(accounts[1], id, 1);
};
