import React, { useState, useEffect, Component } from "react";
import CollaterizeContract from "./contracts/Collaterize.json";
import TimeLiquidationCheck from "./contracts/TimeLiquidationCheck.json";
import getWeb3 from "./getWeb3";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import "./App.css";

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [values, setValues] = useState(null);
  const [lcAddresses, setLCAddresses] = useState([]);

  useEffect(() => {
    (async () => {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const instance = new web3.eth.Contract(
        CollaterizeContract.abi,
        CollaterizeContract.networks[networkId] &&
          CollaterizeContract.networks[networkId].address,
        { gasLimit: 1000000, from: accounts[0] }
      );

      const erc20Instances = {};
      const liquidationCheckAddresses = {};
      liquidationCheckAddresses["Time"] =
        TimeLiquidationCheck.networks[networkId].address;

      const values = {};
      values["ETH"] = {
        balance: await web3.eth.getBalance(accounts[0]),
        sum: 0,
        collaterals: [],
      };
      const allCollaterals = await instance.methods
        .getCreatedCollaterals(accounts[0])
        .call();

      for (let i = 0; i < allCollaterals.length; i++) {
        let collateral = await instance.methods
          .collaterals(allCollaterals[i])
          .call();
        if (parseInt(collateral.token) == 0) {
          values["ETH"].collaterals.push({
            owner: await instance.methods
              .collateralOwners(allCollaterals[i])
              .call(),
            amount: collateral.amount,
          });
          values["ETH"].sum += collateral.amount;
        }
      }

      console.log(values);

      setWeb3(web3);
      setAccounts(accounts);
      setContract(instance);
      setValues(values);
      setLCAddresses(liquidationCheckAddresses);

      return () => {};
    })();
  });

  return (
    <Router>
      <Switch>
        <Route exact path="/" render={() => <Home values={values} />} />

        <Route
          path="/create"
          render={() => (
            <Create
              values={values}
              contract={contract}
              web3={web3}
              lcAddresses={lcAddresses}
            />
          )}
        ></Route>
      </Switch>
    </Router>
  );
};
const Home = ({ values }) => {
  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>Asset</th>
            <th>Sum</th>
            <th>Visuals</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>ETH</td>
            <td>{values ? values["ETH"].sum : ""}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
      <Link to="/create">Add Collateral</Link>
    </div>
  );
};

const Create = ({ values, contract, web3, lcAddresses }) => {
  const [asset, setAsset] = useState("ETH");
  var [amount, setAmount] = useState(0);
  const [liquidation, setLiquidation] = useState("Time");
  const [liquidationTime, setLiquidationTime] = useState(null);

  const createCollateral = async () => {
    let res = await contract.methods
      .createCollateralETH(
        lcAddresses[liquidation],
        web3.utils.toHex(liquidationTime)
      )
      .send();
    console.log(res);
  };

  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Asset</td>
            <td>
              <select id="asset" onChange={(e) => setAsset(e.target.value)}>
                <option value="ETH">ETH</option>
                <option value="USDC">USDC</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Amount</td>
            <td>
              <input
                id="amount"
                type="text"
                onChange={(e) => setAmount(parseInt(e.target.value))}
              ></input>
            </td>
          </tr>
          <tr>
            <td>Liquidation</td>
            <td>
              <select
                id="liquidation"
                onChange={(e) => setLiquidation(e.target.value)}
              >
                <option value="Time">Time</option>
              </select>
            </td>
          </tr>
          <tr>
            <td>Time</td>
            <td>
              <input
                type="datetime-local"
                onChange={(e) =>
                  setLiquidationTime(
                    Math.ceil(new Date(e.target.value).getTime() / 1000)
                  )
                }
              ></input>
            </td>
          </tr>
        </tbody>
      </table>
      <button onClick={createCollateral}>Create Collateral</button>
    </div>
  );
};

export default App;
