import React, { useState, useEffect, Component } from "react";
import CollaterizeContract from "./contracts/Collaterize.json";
import ILiquidationCheck from "./contracts/ILiquidationCheck.json";
import CountLiquidationCheck from "./contracts/CountLiquidationCheck.json";

import IERC20 from "./contracts/IERC20.json";
import IERC20Metadata from "./contracts/IERC20Metadata.json";
import TestERC20 from "./contracts/ERC20.json";
import KeylinkDelegator from "./contracts/KeylinkDelegator.json";
import getWeb3 from "./getWeb3";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Checkbox from "@material-ui/core/Checkbox";

import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Table from "@material-ui/core/Table";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Paper from "@material-ui/core/Paper";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";
import Key from "@material-ui/icons/VpnKey";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

import { IconButton } from "@material-ui/core";

const WhiteTypography = withStyles({
  root: {
    color: "#FFFFFF",
  },
})(Typography);

const Contracting = ({
  values,
  keylinkContract,
  web3,
  classes,
  setOpenBackdrop,
  account,
  setPage,
}) => {
  // if (!web3) window.location = "/";
  const [asset, setAsset] = useState("Ether");
  const [name, setName] = useState("");
  const [accounts, setAccounts] = useState(2);
  const [delegatorContract, setDelegatorContract] = useState(null);
  const [lcAddresses, setLCAddresses] = useState(null);
  const [constants, setConstants] = useState(null);
  const [solution, setSolution] = useState(0);
  const [mustApprove, setMustApprove] = useState(true);
  const [temporaryKeyDuration, setTemporaryKeyDuration] = useState(0);
  const [payToClaimAmount, setPayToClaimAmount] = useState(0);
  const [amount, setAmount] = useState(0);

  const handleAssetSelection = (e) => {
    const val = e.target.value;
  };

  const createListing = async () => {
    let response;
    const _amount = Math.ceil(
      amount * Math.pow(10, constants.assets[asset].decimals)
    );

    if (constants.assets[asset].address == "NATIVE") {
      response = await keylinkContract.methods
        .createCollateralETH(2, "EasyContracting", lcAddresses[0], 2)
        .send({ from: account, value: _amount });
    } else {
      response = await keylinkContract.methods
        .createCollateralERC20(
          constants.assets[asset].address,
          _amount,
          2,
          "EasyContracting",
          lcAddresses[0],
          2
        )
        .send({ from: account });
    }

    let id = response.events.Created.returnValues.id;

    await keylinkContract.methods
      .approve(delegatorContract.options.address, id, 0)
      .send({ from: account });

    response = await delegatorContract.methods
      .entrust(id, 0, solution + 1, false, "0x" + String(2).padStart(64, "0"))
      .send({ from: account });
  };

  useEffect(() => {
    (async () => {
      setPage("Contracts");

      try {
        const networkId = await web3.eth.net.getId();

        const lc = [CountLiquidationCheck.networks[networkId].address];
        setLCAddresses(lc);

        setDelegatorContract(
          new web3.eth.Contract(
            KeylinkDelegator.abi,
            KeylinkDelegator.networks[networkId] &&
              KeylinkDelegator.networks[networkId].address,
            { gasLimit: 1000000, from: account }
          )
        );

        const tokenList = [TestERC20.networks[networkId].address];
        const _constants = {
          assets: {
            Ether: {
              address: "NATIVE",
              decimals: 18,
              balance: await web3.eth.getBalance(account),
              symbol: "ETH",
            },
          },
        };
        for (let i = 0; i < tokenList.length; i++) {
          const addr = tokenList[i];
          let erc20metadatacontract = new web3.eth.Contract(
            IERC20Metadata.abi,
            addr,
            { from: account, gasLimit: 60000 }
          );
          let erc20contract = new web3.eth.Contract(IERC20.abi, addr);
          console.log(erc20metadatacontract.methods);
          let name = await erc20metadatacontract.methods.name().call();
          let symbol = await erc20metadatacontract.methods.symbol().call();
          let decimals = await erc20metadatacontract.methods.decimals().call();
          let balance = await erc20contract.methods.balanceOf(account).call();

          _constants.assets[name] = {
            address: addr,
            decimals: decimals,
            balance: balance,
            symbol: symbol,
          };

          console.log(_constants[name]);
        }
        setConstants(_constants);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <div class="center body-vertical-span">
      <FormControl>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell colSpan={3} className={classes.add_collateral_bar}>
                  <div style={{ display: "flex" }}>
                    <div style={{ width: "50%" }}>
                      <Box alignItems="flex-end">
                        <WhiteTypography noWrap variant="subtitle1">
                          Reservable Key
                        </WhiteTypography>
                      </Box>
                    </div>
                    <div style={{ width: "50%" }}>
                      <Box
                        className={classes.action_dialog}
                        alignItems="flex-end"
                      >
                        <WhiteTypography variant="caption">
                          Powered by <b>Keylink</b>
                        </WhiteTypography>
                      </Box>
                    </div>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell>
                  <FormControl>
                    <TextField
                      label=""
                      value={amount}
                      className={classes.amount_input}
                      onChange={(e) => parseFloat(setAmount(e.target.value))}
                    ></TextField>
                  </FormControl>
                </TableCell>
                <TableCell rowspan={3}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={mustApprove}
                        onChange={(e) => {
                          setMustApprove(e.target.checked);
                        }}
                      />
                    }
                    label="Approved Only"
                  />
                  <br />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={mustApprove}
                        onChange={(e) => {
                          setMustApprove(e.target.checked);
                        }}
                      />
                    }
                    label="Time-Limited"
                  />
                  <br />

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={mustApprove}
                        onChange={(e) => {
                          setMustApprove(e.target.checked);
                        }}
                      />
                    }
                    label="Deposit"
                  />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>Assets</TableCell>
                <TableCell>
                  <Select native onChange={handleAssetSelection}>
                    {constants
                      ? Object.keys(constants.assets).map((key, index) => (
                          <option value={key}>
                            {key} (
                            {constants.assets[key].balance /
                              Math.pow(10, constants.assets[key].decimals)}{" "}
                            {constants.assets[key].symbol})
                          </option>
                        ))
                      : ""}
                  </Select>
                </TableCell>
              </TableRow>

              {/* <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>
                  <FormControl>
                    <Select
                      defaultValue={0}
                      onChange={(e) => setSolution(e.target.value)}
                    >
                      <option value={0}>Time-Limited Reservation</option>
                      <option value={1}>Deposit</option>
                    </Select>
                  </FormControl>
                </TableCell>
              </TableRow> */}

              {solution == 0 ? (
                <TableRow>
                  <TableCell>Duration</TableCell>
                  <TableCell>
                    <TextField
                      style={{ width: 50 }}
                      value={temporaryKeyDuration}
                      onChange={(e) => {
                        if (!isNaN(e.target.value))
                          setTemporaryKeyDuration(parseFloat(e.target.value));
                      }}
                    ></TextField>
                    Days
                  </TableCell>
                </TableRow>
              ) : (
                ""
              )}

              {solution == 1 ? (
                <TableRow>
                  <TableCell>Deposit</TableCell>
                  <TableCell>
                    <TextField
                      value={payToClaimAmount}
                      onChange={(e) => {
                        if (!isNaN(e.target.value))
                          setPayToClaimAmount(parseFloat(e.target.value));
                      }}
                    ></TextField>
                  </TableCell>
                </TableRow>
              ) : (
                ""
              )}
            </TableBody>
          </Table>
          <Grid container justify="flex-end">
            <Link to="/" style={{ textDecoration: "none" }}>
              <Button>Back</Button>
            </Link>
            <Button>Create</Button>
          </Grid>
        </TableContainer>
      </FormControl>
    </div>
  );
};

export default Contracting;
