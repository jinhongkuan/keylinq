import React, { useState, useEffect, Component } from "react";
import CollaterizeContract from "./contracts/Collaterize.json";
import ILiquidationCheck from "./contracts/ILiquidationCheck.json";
import CountLiquidationCheck from "./contracts/CountLiquidationCheck.json";

import IERC20 from "./contracts/IERC20.json";
import IERC20Metadata from "./contracts/IERC20.json";
import getWeb3 from "./getWeb3";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Table from "@material-ui/core/Table";
import FormControl from "@material-ui/core/FormControl";
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

import "./App.css";
import { IconButton } from "@material-ui/core";

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

const styles = (theme) => ({
  collateral_card: {
    width: 375,
    minWidth: 275,
    minHeight: 200,
    marginBottom: 25,
    position: "relative",
  },

  amount_display: {
    bottom: 25,
    left: 25,
    fontSize: 20,
    position: "absolute",
  },

  title_display: {
    top: 25,
    left: 25,
    fontSize: 18,
    position: "absolute",
  },

  unlock_button: {
    bottom: 21,
    padding: 4,
    right: 25,
    fontSize: 16,
    position: "absolute",
  },

  key_box: {
    top: 19,
    right: 25,
    position: "absolute",
  },

  key: {
    position: "relative",
  },

  send_address: {
    marginTop: 15,
    paddingTop: 15,
    width: "100%",
  },

  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },

  amount_input: {},

  tool_bar: {
    justifyContent: "flex-end",
    display: "flex",
    width: "100%",
  },

  connect_wallet: {
    width: 150,
  },
});

const App = (props) => {
  const { classes } = props;
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [collateralList, setCollateralList] = useState(null);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const connectWeb3 = async () => {
    console.log("connected");
    // Get network provider and web3 instance.
    let web3;
    try {
      web3 = await getWeb3();
    } catch (error) {
      return false;
    }

    // Use web3 to get the user's accounts.
    const account = (await web3.eth.getAccounts())[0];
    // Get the contract instance.
    const networkId = await web3.eth.net.getId();
    const instance = new web3.eth.Contract(
      CollaterizeContract.abi,
      CollaterizeContract.networks[networkId] &&
        CollaterizeContract.networks[networkId].address,
      { gasLimit: 1000000, from: account }
    );

    const allCollaterals = await instance.methods
      .getOwnedCollaterals(account)
      .call();

    const collaterals = [];

    for (let i = 0; i < allCollaterals.length; i++) {
      let collateral = await instance.methods
        .getCollateral(allCollaterals[i])
        .call();

      let symbol;
      let decimals;

      if (parseInt(collateral.token) == 0) {
        symbol = "ETH";
        decimals = 18;
      } else {
        var erc20MetadataContract = new web3.eth.Contract(
          IERC20Metadata.abi,
          collateral.token
        );
        symbol = await erc20MetadataContract.methods.symbol().call();
        decimals = await erc20MetadataContract.methods.decimals().call();
      }

      let liquidateAs = [];
      const lc = new web3.eth.Contract(
        ILiquidationCheck.abi,
        collateral.liquidation
      );

      for (let j = 0; j < collateral.accounts.length; j++) {
        if (collateral.accounts[j] == account) {
          let response = await lc.methods
            .liquidationCheck(collateral.accounts, j, collateral.args)
            .call();
          if (response) {
            liquidateAs.push(j);
          }
        }
      }

      collaterals.push({
        id: allCollaterals[i],
        amount: parseFloat(collateral.amount),
        symbol: symbol,
        decimals: parseFloat(decimals),
        name: collateral.uri,
        accounts: collateral.accounts,
        liquidation: liquidateAs,
      });
    }
    setWeb3(web3);
    setAccount(account);
    setContract(instance);
    setCollateralList(collaterals);
    return true;
  };

  useEffect(() => {
    (async () => {
      if (window.ethereum) await connectWeb3();
      console.log("start");
    })();
  }, []);

  const handleBackdropClose = () => {
    setOpenBackdrop(false);
  };
  return (
    <ThemeProvider theme={theme}>
      <Backdrop
        className={classes.backdrop}
        open={openBackdrop}
        onClick={handleBackdropClose}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <AppBar position="static" className="appbar">
        <Toolbar variant="dense">
          <Typography variant="h5">BitVault</Typography>
          <Box className={classes.tool_bar}>
            <Button
              variant="contained"
              color={account ? "disabled" : "secondary"}
              className={classes.connect_wallet}
              onClick={connectWeb3}
            >
              {account ? account.substr(0, 10) + "..." : "Connect"}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      <Router>
        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <Home
                collateralList={collateralList}
                account={account}
                classes={classes}
                contract={contract}
                web3={web3}
                setOpenBackdrop={setOpenBackdrop}
              />
            )}
          />

          <Route
            path="/create"
            render={() => (
              <Create
                contract={contract}
                web3={web3}
                classes={classes}
                setOpenBackdrop={setOpenBackdrop}
              />
            )}
          ></Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
};

App.propTypes = {
  classes: PropTypes.object.isRequired,
};

const Home = ({
  collateralList,
  account,
  classes,
  contract,
  web3,
  setOpenBackdrop,
}) => {
  const [open, setOpen] = useState(false);

  const [col, setCol] = useState(null);
  const [ind, setInd] = useState(0);

  const handleKeyClick = (collateral, index) => {
    console.log("clicked");
    setCol(collateral);
    setInd(index);
    setOpen(true);
  };

  const handleClose = async (cont) => {
    const id = col.id;
    const index = ind;
    setCol(null);
    setInd(0);
    setOpen(false);
    if (cont) {
      setOpenBackdrop(true);
      let response = await contract.methods
        .transfer(document.getElementById("recepient_address").value, id, index)
        .send();
      setOpenBackdrop(false);
      window.location.reload(false);
    }
  };

  const handleUnlock = async (col, index) => {
    setOpenBackdrop(true);
    let response = await contract.methods.liquidate(col.id, index).send();
    setOpenBackdrop(false);
    window.location.reload(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Key Transfer</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Send key <b>{ind}</b> of "{col ? col.name : ""}" to another user?
            <TextField
              required
              id="recepient_address"
              label="Recepient Wallet Address"
              variant="outlined"
              className={classes.send_address}
            ></TextField>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose(false)} color="primary" autoFocus>
            Cancel
          </Button>
          <Button onClick={() => handleClose(true)} color="primary">
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      <div>
        <div class="center body-vertical-span">
          <div>
            {collateralList
              ? collateralList.map((collateral) => (
                  <Card className={classes.collateral_card} elevation={3}>
                    <CardContent>
                      <Typography className={classes.title_display}>
                        {collateral.name}
                      </Typography>
                      <Typography className={classes.amount_display}>
                        {collateral.amount / Math.pow(10, collateral.decimals)}{" "}
                        {collateral.symbol}
                      </Typography>
                      <Box className={classes.key_box}>
                        {collateral.accounts.map((addr, i) => (
                          <Tooltip title={addr == account ? "You" : addr}>
                            <div>
                              <IconButton
                                className={classes.key}
                                disabled={addr == account ? false : true}
                                onClick={() => handleKeyClick(collateral, i)}
                              >
                                <Key
                                  color={
                                    addr == account ? "secondary" : "disabled"
                                  }
                                />
                              </IconButton>
                              <br></br>
                            </div>
                          </Tooltip>
                        ))}
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button
                        size="small"
                        className={classes.unlock_button}
                        disabled={collateral.liquidation.length == 0}
                        onClick={() =>
                          handleUnlock(collateral, collateral.liquidation[0])
                        }
                      >
                        Unlock
                      </Button>
                    </CardActions>
                  </Card>
                ))
              : ""}

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

const Create = ({ values, contract, web3, classes, setOpenBackdrop }) => {
  if (!web3) window.location = "/";
  const [asset, setAsset] = useState("ETH");
  const [name, setName] = useState("");
  const [accounts, setAccounts] = useState(2);
  const [lcContract, setLCContract] = useState(null);
  const [lcAddresses, setLCAddresses] = useState(null);

  var [amount, setAmount] = useState(0);
  const constants = {
    assets: {
      ETH: { address: "0x" + "0" * 40, decimals: 18 },
      USDC: { address: "", decimals: 18 },
    },
  };
  useEffect(() => {
    (async () => {
      const networkId = await web3.eth.net.getId();

      const lc = [CountLiquidationCheck.networks[networkId].address];
      setLCContract(lc[0]);
      setLCAddresses(lc);
    })();
  }, []);

  const createCollateral = async () => {
    setOpenBackdrop(true);
    let response;

    if (web3.utils.hexToNumber(constants.assets[asset].address) == 0) {
      response = await contract.methods
        .createCollateralETH(
          accounts,
          name,
          lcContract,
          web3.utils.toHex(accounts)
        )
        .send({
          value: Math.ceil(
            amount * Math.pow(10, constants.assets[asset].decimals)
          ),
        });
    }

    setOpenBackdrop(false);
    window.location = "/";
  };

  const handleAssetSelection = (e) => {
    const val = e.target.value;
    if (val == "custom") {
      setAsset("0x0");
    } else {
      setAsset(val);
    }
  };

  return (
    <div class="center body-vertical-span">
      <FormControl>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Descriptor</TableCell>
                <TableCell>
                  <TextField
                    label=""
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                  ></TextField>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Assets</TableCell>
                <TableCell>
                  <Select native onChange={handleAssetSelection}>
                    {constants
                      ? Object.keys(constants.assets).map((key, index) => (
                          <option value={key}>
                            {key} ({constants.assets[key].address})
                          </option>
                        ))
                      : ""}
                    <option value="custom">Custom ERC20 Contract</option>
                  </Select>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Amount</TableCell>
                <TableCell>
                  <TextField
                    label=""
                    value={amount}
                    className={classes.amount_input}
                    onChange={(e) => parseFloat(setAmount(e.target.value))}
                  ></TextField>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Keys</TableCell>
                <TableCell>
                  <Select
                    onChange={(e) => {
                      setAccounts(e.target.value);
                    }}
                    value={accounts}
                  >
                    {[...Array(4).keys()].map((val) => (
                      <option value={val + 2}>{val + 2}</option>
                    ))}
                  </Select>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Grid container justify="flex-end">
            <Link to="/">
              <Button>Back</Button>
            </Link>
            <Button onClick={createCollateral}>Create</Button>
          </Grid>
        </TableContainer>
      </FormControl>
    </div>
  );
};

export default withStyles(styles)(App);
