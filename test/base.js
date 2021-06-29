const Collaterize = artifacts.require("Collaterize");
const CountLiquidationCheck = artifacts.require("CountLiquidationCheck");
const ERC20 = artifacts.require("ERC20");

contract("Collaterize", async (accounts) => {
  before(async () => {
    countContract = await CountLiquidationCheck.deployed();
    countContract = new web3.eth.Contract(
      countContract.abi,
      countContract.address,
      {
        gasLimit: 1000000,
      }
    );

    collaterizeContract = await Collaterize.deployed();
    collaterizeContract = new web3.eth.Contract(
      collaterizeContract.abi,
      collaterizeContract.address,
      { gasLimit: 1000000 }
    );

    ERC20Contract = await ERC20.deployed();
    ERC20Contract = new web3.eth.Contract(
      ERC20Contract.abi,
      ERC20Contract.address,
      { gasLimit: 1000000 }
    );
  });

  it("ERC20 collaterals", async () => {
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
  });
});
