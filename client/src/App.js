import React, { useState, useEffect, Component } from "react";
import CollaterizeContract from "./contracts/Collaterize.json";
import TimeLiquidationCheck from "./contracts/TimeLiquidationCheck.json";
import getWeb3 from "./getWeb3";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";

import "./App.css";

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "Nunito",
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState(null);
  const [contract, setContract] = useState(null);
  const [values, setValues] = useState(null);
  const [lcAddresses, setLCAddresses] = useState([]);

  const connectWeb3 = async () => {
    console.log("connected");
    // Get network provider and web3 instance.
    const web3 = await getWeb3();

    // Use web3 to get the user's accounts.
    const accounts = await web3.eth.getAccounts();
    console.log(accounts);
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

    setWeb3(web3);
    setAccounts(accounts);
    setContract(instance);
    setValues(values);
    setLCAddresses(liquidationCheckAddresses);
    return () => {};
  };

  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/"
          render={() => <Home values={values} connectWeb3={connectWeb3} />}
        />

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
const Home = ({ values, connectWeb3 }) => {
  return (
    <ThemeProvider theme={theme}>
      <div>
        <AppBar position="static" className="appbar">
          <Toolbar variant="dense">
            <Typography variant="h5">Collaterize</Typography>
            <Button
              variant="contained"
              color="secondary"
              className="connect-wallet"
              onClick={connectWeb3}
            >
              Connect to Wallet
            </Button>
          </Toolbar>
        </AppBar>
        <div class="center body-vertical-span">
          <div>
            <div class="center">
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">Asset</TableCell>
                      <TableCell align="center">Sum</TableCell>
                      <TableCell align="center">Visuals</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>ETH</TableCell>
                      <TableCell>{values ? values["ETH"].sum : ""}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            <br />
            <div class="center">
              <Link to="/create">
                <Button variant="contained" color="primary">
                  Add Collateral
                </Button>
              </Link>
            </div>

            <br />
          </div>
        </div>
      </div>
    </ThemeProvider>
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
