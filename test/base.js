const Keylink = artifacts.require("Keylink");
const KeylinkDelegator = artifacts.require("KeylinkDelegator");

const CountLiquidationCheck = artifacts.require("CountLiquidationCheck");
const ERC20 = artifacts.require("ERC20");

contract("Keylink", async (accounts) => {
  before(async () => {
    countContract = await CountLiquidationCheck.deployed();
    countContract = new web3.eth.Contract(
      countContract.abi,
      countContract.address,
      {
        gasLimit: 1000000,
      }
    );

    keylinkContract = await Keylink.deployed();
    keylinkContract = new web3.eth.Contract(
      keylinkContract.abi,
      keylinkContract.address,
      { gasLimit: 1000000 }
    );

    delegatorContract = await KeylinkDelegator.deployed();
    delegatorContract = new web3.eth.Contract(
      delegatorContract.abi,
      delegatorContract.address,
      { gasLimit: 1000000 }
    );

    ERC20Contract = await ERC20.deployed();
    ERC20Contract = new web3.eth.Contract(
      ERC20Contract.abi,
      ERC20Contract.address,
      { gasLimit: 1000000 }
    );

    // ERC20Contract.events
    //   .allEvents()
    //   .on("data", (event) => console.log(event.event, "\n", event.returnValues))
    //   .on("error", console.error);

    id = null;
  });

  it("ERC20 collaterals", async () => {
    await ERC20Contract.methods
      .approve(keylinkContract.options.address, 1000)
      .send({ from: accounts[0] });

    let response = await keylinkContract.methods
      .createCollateralERC20(
        ERC20Contract.options.address,
        1000,
        2,
        "Commissioned sculpture",
        countContract.options.address,
        2
      )
      .send({ from: accounts[0] });

    id = response.events.Created.returnValues.id;
  });

  it("Delegation working", async () => {
    await keylinkContract.methods
      .delegate(accounts[1], id, 1)
      .send({ from: accounts[0] });
    assert.equal(
      await keylinkContract.methods
        .getEffectiveOwner(id, 1)
        .call({ from: accounts[0] }),
      accounts[1]
    );
  });

  it("Delegator working", async () => {
    await keylinkContract.methods
      .approve(delegatorContract.options.address, id, 0)
      .send({ from: accounts[0] });
    let response = await delegatorContract.methods
      .entrust(id, 0, 2, false, "0x" + String(2).padStart(64, "0"))
      .send({ from: accounts[0] });
    let delegator_id = response.events.Entrusted.returnValues.id;
    await delegatorContract.methods
      .acquire(delegator_id)
      .send({ from: accounts[1] });
    assert.equal(
      await keylinkContract.methods
        .getEffectiveOwner(delegator_id, 0)
        .call({ from: accounts[0] }),
      accounts[1]
    );
  });
});
