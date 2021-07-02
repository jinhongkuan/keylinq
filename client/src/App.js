import React, { useState, useEffect, Component } from "react";
import CollaterizeContract from "./contracts/Collaterize.json";
import ILiquidationCheck from "./contracts/ILiquidationCheck.json";
import CountLiquidationCheck from "./contracts/CountLiquidationCheck.json";

import IERC20 from "./contracts/IERC20.json";
import IERC20Metadata from "./contracts/IERC20Metadata.json";
import TestERC20 from "./contracts/ERC20.json";
import getWeb3 from "./getWeb3";
import { Express, Request, Deposit } from "./Express.js";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import { NFTStorage, File } from "nft.storage";

import Logo from "./resources/logo.jpg";
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
import purple from "@material-ui/core/colors/purple";
import "./App.css";
import { IconButton } from "@material-ui/core";
import { readURL } from "./utils";

const secret = require("./secret.json");
const nftStorageClient = new NFTStorage({ token: secret.nftstorage_api });
// const uint8ArrayConcat = require("uint8arrays/concat");
// const uint8ArrayToString = require("uint8arrays/to-string");

const mainTheme = createMuiTheme({
  typography: {
    fontFamily: [
      "Nunito",
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
    ].join(","),
  },

  palette: {
    primary: {
      main: "#000000",
    },
  },
});

const contractSiteTheme = createMuiTheme({
  palette: {
    primary: {
      main: "#8bc34a",
    },
    secondary: {
      main: "#cddc39",
    },
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

  share_link: {
    marginTop: 0,
    padding: 0,
    width: "300px",
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

  action_dialog: {
    justifyContent: "flex-end",
    display: "flex",
    width: "100%",
    height: "100%",
  },

  connect_wallet: {
    width: 150,
  },

  add_collateral_bar: {
    background: theme.palette.secondary.main,
    paddingTop: 8,
    paddingBottom: 8,
  },

  create_request_bar: {
    background: theme.palette.primary.main,
    paddingTop: 8,
    paddingBottom: 8,
  },

  deposit_text_field: {
    width: "50vw",
  },
});

const WhiteTypography = withStyles({
  root: {
    color: "#FFFFFF",
  },
})(Typography);

const App = (props) => {
  const { classes } = props;
  const [page, setPage] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [constants, setConstants] = useState(null);
  const [account, setAccount] = useState(null);
  const [keylinkContract, setKeylinkContract] = useState(null);
  const [delegatorContract, setDelegatorContract] = useState(null);
  const [collateralList, setCollateralList] = useState(null);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const [lcAddresses, setLCAddresses] = useState(null);

  const connectWeb3 = async () => {
    // Get network provider and web3 instance.
    let web3;
    try {
      web3 = await getWeb3();
    } catch (error) {
      return false;
    }

    // Use web3 to get the user's accounts.
    const account = (await web3.eth.getAccounts())[0];
    // Get the keylinkContract instance.
    const networkId = await web3.eth.net.getId();
    const lc = [CountLiquidationCheck.networks[networkId].address];

    setLCAddresses(lc);

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
          collateral.token,
          { from: account, gasLimit: 60000 }
        );
        symbol = await erc20MetadataContract.methods.symbol().call();
        decimals = await erc20MetadataContract.methods.decimals().call();
      }

      let liquidateAs = [];
      const lc = new web3.eth.Contract(
        ILiquidationCheck.abi,
        collateral.liquidation,
        { from: account, gasLimit: 60000 }
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

      let name;
      try {
        // await nftStorageClient.check(collateral.uri);
        const gateway = "https://ipfs.io/ipfs/";

        const details = JSON.parse(
          readURL(gateway + collateral.uri + "/details.json")
        );
        name = details.name + " (" + details.service + ")";
      } catch (error) {
        console.log(error);
        name = collateral.uri;
      }

      collaterals.push({
        id: allCollaterals[i],
        amount: parseFloat(collateral.amount),
        symbol: symbol,
        decimals: parseFloat(decimals),
        name: name,
        accounts: collateral.accounts,
        liquidation: liquidateAs,
      });
    }

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
    }

    setWeb3(web3);
    setConstants(_constants);
    setAccount(account);
    setKeylinkContract(instance);
    setDelegatorContract(delegatorContract);
    setCollateralList(collaterals);
    return true;
  };

  useEffect(() => {
    (async () => {
      if (window.ethereum) await connectWeb3();
    })();
  }, []);

  const handleBackdropClose = () => {
    setOpenBackdrop(false);
  };
  return (
    <ThemeProvider theme={mainTheme}>
      <Router>
        <Backdrop
          className={classes.backdrop}
          open={openBackdrop}
          onClick={handleBackdropClose}
        >
          <CircularProgress color="inherit" />
        </Backdrop>
        <AppBar position="static" className="appbar">
          <Toolbar variant="dense">
            <Link to="/" style={{ textDecoration: "none", color: "#FFF" }}>
              <img src={Logo} style={{ height: 50 }} />
              {/* <Typography variant="h5" noWrap style={{ width: 200 }}>
                {page == "Express" ? "Keylink Express" : "Keylink"}
              </Typography> */}
            </Link>

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

        <Switch>
          <Route
            exact
            path="/"
            render={() => (
              <Home
                collateralList={collateralList}
                account={account}
                classes={classes}
                keylinkContract={keylinkContract}
                web3={web3}
                setOpenBackdrop={setOpenBackdrop}
                setPage={setPage}
              />
            )}
          />

          <Route
            path="/create/"
            render={() => (
              <Create
                keylinkContract={keylinkContract}
                account={account}
                web3={web3}
                classes={classes}
                setOpenBackdrop={setOpenBackdrop}
                setPage={setPage}
                constants={constants}
                lcAddresses={lcAddresses}
              />
            )}
          ></Route>

          <Route
            path="/express/"
            render={() => (
              <Express
                keylinkContract={keylinkContract}
                account={account}
                web3={web3}
                classes={classes}
                setOpenBackdrop={setOpenBackdrop}
                setPage={setPage}
              />
            )}
          ></Route>

          <Route
            path="/request/"
            render={() => (
              <Request
                keylinkContract={keylinkContract}
                account={account}
                web3={web3}
                classes={classes}
                setOpenBackdrop={setOpenBackdrop}
                setPage={setPage}
                constants={constants}
              />
            )}
          ></Route>

          <Route
            path="/deposit/:cid?"
            render={({ match }) => (
              <Deposit
                keylinkContract={keylinkContract}
                account={account}
                web3={web3}
                classes={classes}
                constants={constants}
                setOpenBackdrop={setOpenBackdrop}
                setPage={setPage}
                lcAddresses={lcAddresses}
                match={match}
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
  keylinkContract,
  web3,
  setOpenBackdrop,
  setPage,
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
      try {
        let response = await keylinkContract.methods
          .transfer(
            document.getElementById("recepient_address").value,
            id,
            index
          )
          .send();
        window.location.reload(false);
      } catch (error) {
        console.log(error);
        setOpenBackdrop(false);
      }
    }
  };

  const handleUnlock = async (col, index) => {
    setOpenBackdrop(true);
    try {
      let response = await keylinkContract.methods
        .liquidate(col.id, index)
        .send();
      window.location.reload(false);
    } catch (error) {
      console.log(error);
      setOpenBackdrop(false);
    }
  };

  useEffect(() => {
    (async () => {
      setPage("Home");
    })();
  }, []);

  return (
    <ThemeProvider theme={mainTheme}>
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
              <Grid container spacing={2} justify="center">
                <Grid item>
                  <Link to="/create" style={{ textDecoration: "none" }}>
                    <Button variant="contained" color="primary">
                      Create Vault
                    </Button>
                  </Link>
                </Grid>
                <Grid item>
                  <Link to="/express" style={{ textDecoration: "none" }}>
                    <Button variant="contained" color="primary">
                      Quickstart
                    </Button>
                  </Link>
                </Grid>
              </Grid>
            </div>

            <br />
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

const Create = ({
  values,
  keylinkContract,
  web3,
  classes,
  setOpenBackdrop,
  account,
  setPage,
  constants,
  lcAddresses,
}) => {
  if (!web3) window.location = "/";
  const [asset, setAsset] = useState("ETH");
  const [name, setName] = useState("");
  const [accounts, setAccounts] = useState(2);

  var [amount, setAmount] = useState(0);

  useEffect(() => {
    (async () => {
      setPage("Create");
      const networkId = await web3.eth.net.getId();
    })();
  }, []);

  const createCollateral = async () => {
    setOpenBackdrop(true);
    let response;
    let hasApproved = false;
    let ERC20Contract;

    try {
      if (constants.assets[asset].address == "NATIVE") {
        response = await keylinkContract.methods
          .createCollateralETH(
            accounts,
            name,
            lcAddresses[0],
            web3.utils.toHex(accounts)
          )
          .send({
            value: Math.ceil(
              amount * Math.pow(10, constants.assets[asset].decimals)
            ),
          });
      } else {
        let am = Math.ceil(
          amount * Math.pow(10, constants.assets[asset].decimals)
        ).toString();

        console.log(am);

        ERC20Contract = new web3.eth.Contract(
          IERC20.abi,
          constants.assets[asset].address,
          { from: account, gasLimit: 60000 }
        );
        await ERC20Contract.methods
          .approve(keylinkContract.options.address, am)
          .send();
        hasApproved = true;

        response = await keylinkContract.methods
          .createCollateralERC20(
            constants.assets[asset].address,
            am,
            accounts,
            name,
            lcAddresses[0],
            web3.utils.toHex(accounts)
          )
          .send();
      }

      window.location = "/";
    } catch (error) {
      console.log(error);
      // if (hasApproved) {
      //   await ERC20Contract.methods.approve(keylinkContract.options.address, 0).send();
      // }
      setOpenBackdrop(false);
    }
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
                <TableCell colSpan={2} className={classes.add_collateral_bar}>
                  <div style={{ display: "flex" }}>
                    <div style={{ width: "50%" }}>
                      <Box alignItems="flex-end">
                        <WhiteTypography noWrap variant="subtitle1">
                          Create Vault
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
                <TableCell>Descriptor</TableCell>
                <TableCell>
                  <FormControl>
                    <TextField
                      label=""
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                    ></TextField>
                  </FormControl>
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
              </TableRow>
              <TableRow>
                <TableCell>Keys</TableCell>
                <TableCell>
                  <FormControl>
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
                  </FormControl>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Grid container justify="flex-end">
            <Link to="/" style={{ textDecoration: "none" }}>
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
