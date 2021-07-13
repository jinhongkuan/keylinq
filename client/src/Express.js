import React, { useState, useEffect, Component } from "react";
import ReactDOM from "react-dom";
import KeylinkContract from "./contracts/Keylink.json";
import ILiquidationCheck from "./contracts/ILiquidationCheck.json";
import CountLiquidationCheck from "./contracts/CountLiquidationCheck.json";

import IERC20 from "./contracts/IERC20.json";
import IERC20Metadata from "./contracts/IERC20Metadata.json";
import TestERC20 from "./contracts/ERC20.json";
import KeylinkDelegator from "./contracts/KeylinkDelegator.json";
import getWeb3 from "./getWeb3";
import { NFTStorage, File } from "nft.storage";
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
import FileCopy from "@material-ui/icons/FileCopy";
import Close from "@material-ui/icons/Close";
import Select from "@material-ui/core/Select";
import ListAlt from "@material-ui/icons/ListAlt";
import SwapIcon from "@material-ui/icons/SwapHoriz";
import PaymentIcon from "@material-ui/icons/Payment";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

import { IconButton } from "@material-ui/core";
import { readURL } from "./utils";

import OnramperWidget from "@onramper/widget";
const ONRAMPER_API = "pk_test_jWCXCkJiKkFktEIitty3O160jc7OHEj2l0Hq93ngofw0";

const WhiteTypography = withStyles({
  root: {
    color: "#FFFFFF",
  },
})(Typography);

const secret = require("./secret.json");
const nftStorageClient = new NFTStorage({ token: secret.nftstorage_api });
const axios = require("axios");
const server_url = secret.server_url;
// const uint8ArrayConcat = require("uint8arrays/concat");
// const uint8ArrayToString = require("uint8arrays/to-string");

const Express = ({
  keylinkContract,
  web3,
  classes,
  setOpenBackdrop,
  account,
  setPage,
}) => {
  // if (!web3) window.location = "/";
  const [userListings, setUserListings] = useState(null);
  useEffect(() => {
    (async () => {
      setPage("Express");

      try {
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  return (
    <div class="center body-vertical-span">
      <div class="center">
        <Grid container spacing={2} justify="center">
          <Grid item>
            <Link to="/request" style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                color="secondary"
                style={{
                  width: 200,
                  height: 200,
                  margin: 20,
                  textTransform: "none",
                }}
              >
                <div style={{ marginTop: 15 }}>
                  <ListAlt style={{ width: 50, height: 50 }}></ListAlt>
                  <p>
                    <h2 style={{ margin: 0 }}>Request</h2>
                  </p>
                  <p>Create a shareable link for deposit payment</p>
                </div>
              </Button>
            </Link>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="secondary"
              style={{
                width: 200,
                height: 200,
                margin: 20,
                textTransform: "none",
              }}
              disabled
            >
              <div style={{ marginTop: 15 }}>
                <SwapIcon style={{ width: 50, height: 50 }}></SwapIcon>
                <p>
                  <h2 style={{ margin: 0 }}>SafeTransfer</h2>
                </p>
                <p>Initiate a reversible crypto transfer (until accepted)</p>
              </div>
            </Button>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

const Request = ({ classes, constants, setOpenBackdrop, account }) => {
  const [asset, setAsset] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [expiration, setExpiration] = useState(0);
  const [amount, setAmount] = useState(0);
  const [ipfsLink, setIPFSLink] = useState("");
  const [openShareDialog, setOpenShareDialog] = useState(false);
  const publishRequest = async () => {
    setOpenBackdrop(true);
    const cid = await nftStorageClient.storeDirectory([
      new File(
        [
          JSON.stringify({
            name: name,
            description: description,
            email: email,
            service: "Payments",
          }),
        ],
        "details.json"
      ),
      new File(
        [
          JSON.stringify({
            amount: amount,
            asset: asset,
            recepient: account,
            expiration: expiration,
          }),
        ],
        "payment.json"
      ),
    ]);

    setIPFSLink(cid);
    setOpenShareDialog(true);
  };

  const closeDialog = async () => {
    window.location = "/express";
  };

  return (
    <div class="center body-vertical-span">
      <div class="center">
        <Dialog
          open={openShareDialog}
          onClose={() => setOpenShareDialog(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Share Link</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              <TextField
                variant="standard"
                defaultValue={window.location.origin + "/deposit/" + ipfsLink}
                className={classes.share_link}
                inputProps={{
                  readOnly: true,
                }}
              ></TextField>
              <IconButton
                onClick={(e) => {
                  navigator.clipboard.writeText(
                    window.location.origin + "/deposit/" + ipfsLink
                  );
                }}
              >
                <FileCopy></FileCopy>
              </IconButton>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => closeDialog()} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
        <ExpressForm
          asset={asset}
          name={name}
          email={email}
          description={description}
          constants={constants}
          expiration={expiration}
          amount={amount}
          setAsset={setAsset}
          setName={setName}
          setEmail={setEmail}
          setDescription={setDescription}
          classes={classes}
          setAmount={setAmount}
          setExpiration={setExpiration}
          continueAction={publishRequest}
          rOnly={false}
        />
      </div>
    </div>
  );
};

const ExpressForm = ({
  asset,
  name,
  email,
  description,
  constants,
  amount,
  expiration,
  setAsset,
  setName,
  setEmail,
  setDescription,
  setExpiration,
  classes,
  setAmount,
  continueAction,
  rOnly,
  memo,
  setMemo,
}) => {
  useEffect(() => {
    if (constants) setAsset(Object.keys(constants.assets)[0]);
  }, constants);
  return (
    <FormControl>
      <TableContainer component={Paper}>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} className={classes.create_request_bar}>
                <div style={{ display: "flex" }}>
                  <div style={{ width: "50%" }}>
                    <Box alignItems="flex-end">
                      <WhiteTypography noWrap variant="subtitle1">
                        {rOnly ? "Fulfill Request" : "Create Request"}
                      </WhiteTypography>
                    </Box>
                  </div>
                  <div style={{ width: "50%" }}>
                    <Box
                      className={classes.action_dialog}
                      alignItems="flex-end"
                    >
                      <WhiteTypography variant="caption">
                        Powered by <b>Keylinq</b>
                      </WhiteTypography>
                    </Box>
                  </div>
                </div>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={{ verticalAlign: "text-top" }}>Name</TableCell>
              <TableCell>
                <FormControl style={{ width: "100%" }}>
                  <TextField
                    label=""
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                    inputProps={{
                      readOnly: rOnly,
                    }}
                  ></TextField>
                </FormControl>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={{ verticalAlign: "text-top" }}>
                Description
              </TableCell>
              <TableCell>
                <FormControl style={{ width: "100%" }}>
                  <TextField
                    label=""
                    size="small"
                    value={description}
                    multiline
                    rows={3}
                    onChange={(e) => setDescription(e.target.value)}
                    variant="outlined"
                    inputProps={{
                      readOnly: rOnly,
                    }}
                  ></TextField>
                </FormControl>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={{ verticalAlign: "text-top" }}>Email</TableCell>
              <TableCell>
                <FormControl style={{ width: "100%" }}>
                  <TextField
                    label=""
                    size="small"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    variant="outlined"
                    inputProps={{
                      readOnly: rOnly,
                    }}
                  ></TextField>
                </FormControl>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={{ verticalAlign: "text-top" }}>
                Amount
              </TableCell>
              <TableCell>
                <FormControl style={{ width: "100%" }}>
                  <TextField
                    label=""
                    size="small"
                    value={amount}
                    className={classes.amount_input}
                    onChange={(e) => parseFloat(setAmount(e.target.value))}
                    variant="outlined"
                    inputProps={{
                      readOnly: rOnly,
                    }}
                  ></TextField>
                </FormControl>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={{ verticalAlign: "text-top" }}>
                Expiration<br></br>(Days)
              </TableCell>
              <TableCell>
                <FormControl style={{ width: "100%" }}>
                  <TextField
                    label=""
                    size="small"
                    value={0 ? "No Expiration" : expiration}
                    className={classes.amount_input}
                    onChange={(e) => parseFloat(setExpiration(e.target.value))}
                    variant="outlined"
                    inputProps={{
                      readOnly: rOnly,
                    }}
                  ></TextField>
                </FormControl>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell style={{ verticalAlign: "text-top" }}>
                Assets
              </TableCell>
              <TableCell>
                {rOnly ? (
                  <TextField
                    label=""
                    size="small"
                    value={asset}
                    inputProps={{
                      readOnly: rOnly,
                    }}
                    variant="outlined"
                  ></TextField>
                ) : (
                  <Select
                    native
                    onChange={(e) => {
                      setAsset(e.target.value);
                    }}
                  >
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
                )}
              </TableCell>
            </TableRow>

            {rOnly ? (
              <TableRow>
                <TableCell style={{ verticalAlign: "text-top" }}>
                  Memo
                </TableCell>
                <TableCell>
                  <FormControl style={{ width: "100%" }}>
                    <TextField
                      label=""
                      size="small"
                      value={memo}
                      multiline
                      rows={2}
                      placeholder="Your name, requests etc."
                      variant="outlined"
                      onChange={(e) => setMemo(e.target.value)}
                    ></TextField>
                  </FormControl>
                </TableCell>
              </TableRow>
            ) : (
              ""
            )}
          </TableBody>
        </Table>
        <Grid container justify="flex-end">
          <Link to="/express" style={{ textDecoration: "none" }}>
            <Button>Back</Button>
          </Link>
          <Button onClick={continueAction}>Continue</Button>
        </Grid>
      </TableContainer>
    </FormControl>
  );
};

const Deposit = ({
  classes,
  constants,
  setOpenBackdrop,
  web3,
  account,
  keylinkContract,
  lcAddresses,
  match,
}) => {
  const [ipfsHash, setIPFSHash] = useState("");
  const [asset, setAsset] = useState("");
  const [name, setName] = useState("");
  const [recepient, setRecepient] = useState("");
  const [expiration, setExpiration] = useState(0);
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [memo, setMemo] = useState("");
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const [openOnRampRequestDialog, setOpenOnRampRequestDialog] = useState(false);
  const confirmationDialog = async () => {
    setOpenBackdrop(true);
    setOpenConfirmationDialog(true);
  };

  const onramp = async (symbol, amount, decimals) => {
    setOpenOnRampRequestDialog(true);
    const amountDecimals_ = amount / Math.pow(10, decimals);
    let amountDecimals = parseFloat(amountDecimals_.toPrecision(5));
    if (amountDecimals < amountDecimals_) {
      let difference = amountDecimals_ - amountDecimals;
      amountDecimals += Math.pow(10, Math.floor(Math.log10(difference)) + 1);
      amountDecimals = parseFloat(amountDecimals.toPrecision(5));
    }
    let onRampMessage = amountDecimals.toString() + " " + symbol;
    onRampMessage = `It appears that you are ${onRampMessage} short of the required deposit payment. Would you like to purchase this amount?`;
    let response = await new Promise((resolve, reject) => {
      addOnRampDialog({ resolve, onRampMessage });
    });

    // fetch rate and convert to USD
    const fromCurrency = "USD";
    const toCurrency = symbol;
    const paymentMethod = "creditCard";
    // let response = await axios.get("https://onramper.tech/rate/${fromCurrency}/${toCurrency}/${paymentMethod}/${amount}");
    let gateways = await axios.get(
      `https://onramper.tech/rate/${fromCurrency}/${toCurrency}/${paymentMethod}/${amountDecimals}?amountInCrypto=true`,
      {
        headers: {
          Authorization: `Basic ${ONRAMPER_API}`,
        },
      }
    );

    let defaultOption = -1;

    for (var i = 0; i < gateways.data.length; i++) {
      let option = gateways.data[i];
      if (option.available) {
        defaultOption = i;
        break;
      }
    }

    if (!response.ok) return false;
    if (defaultOption == -1) {
      addOnRampDialog({
        onRampMessage:
          "Sorry, there is no available payment method on our integrated payment service that supports this transaction. Please visit other exchanges such as Binance or Coinbase to obtain the required crypto.",
      });
      return false;
    }
    response = await new Promise((resolve, reject) => {
      addOnramperWidgetDialog({
        resolve,
        symbol,
        amount: gateways.data[defaultOption].receivedCrypto,
        amountDecimals,
      });
    });

    if (!response.ok) return false;
    return true;
  };

  function addOnRampDialog({ resolve, onRampMessage }) {
    const body = document.getElementsByTagName("body")[0];
    const div = document.createElement("div");
    body.appendChild(div);
    ReactDOM.render(
      <OnRampConfirmationDialog
        resolve={resolve}
        onRampMessage={onRampMessage}
      />,
      div
    );
  }

  function removeOnRampDialog() {
    const div = document.getElementById("onrampdialog");
    const body = document.getElementsByTagName("body")[0];
    body.removeChild(div);
  }

  const OnRampConfirmationDialog = ({ resolve, onRampMessage }) => {
    return (
      <Dialog
        id="onrampdialog"
        open={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Insufficient Funds</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {onRampMessage}
          </DialogContentText>
        </DialogContent>
        {resolve ? (
          <DialogActions>
            <Button
              onClick={() => {
                setOpenBackdrop(false);
                resolve({ ok: false });
                removeOnRampDialog();
              }}
              color="primary"
            >
              No
            </Button>
            <Button
              onClick={() => {
                setOpenBackdrop(false);
                resolve({ ok: true });
                removeOnRampDialog();
              }}
              color="primary"
            >
              Yes
            </Button>
          </DialogActions>
        ) : (
          <DialogActions>
            <Button
              onClick={() => {
                setOpenBackdrop(false);
                removeOnRampDialog();
              }}
              color="primary"
            >
              Okay
            </Button>
          </DialogActions>
        )}
      </Dialog>
    );
  };

  function addOnramperWidgetDialog({
    resolve,
    symbol,
    amount,
    amountDecimals,
  }) {
    const body = document.getElementsByTagName("body")[0];
    const div = document.createElement("div");
    body.appendChild(div);
    ReactDOM.render(
      <OnramperWidgetDialog
        resolve={resolve}
        symbol={symbol}
        amount={amount}
        amountDecimals={amountDecimals}
        filters={{
          onlyCryptos: symbol,
        }}
      />,
      div
    );
  }

  function removeOnramperWidgetDialog() {
    const div = document.getElementById("onramperwidgetdialog");
    const body = document.getElementsByTagName("body")[0];
    body.removeChild(div);
  }

  const OnramperWidgetDialog = ({
    resolve,
    symbol,
    amount,
    amountDecimals,
  }) => {
    return (
      <Dialog
        id="onramperwidgetdialog"
        open={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Purchase Cryptocurrency ({amountDecimals} {symbol})
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            <div
              style={{
                width: "440px",
                height: "595px",
              }}
            >
              <OnramperWidget
                API_KEY={ONRAMPER_API}
                defaultCrypto={symbol}
                defaultAmount={amount}
                defaultPaymentMethod={"onlyCryptos"}
              />
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenBackdrop(false);
              resolve({ ok: false });
              removeOnramperWidgetDialog();
            }}
            color="primary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const fulfillRequest = async () => {
    try {
      let response;
      let balance;
      let amount_units = Math.ceil(
        amount * Math.pow(10, constants.assets[asset].decimals)
      );
      if (constants.assets[asset].address == "NATIVE") {
        balance = await web3.eth.getBalance(account);

        if (balance < amount_units) {
          const onramp_response = await onramp(
            constants.assets[asset].symbol,
            amount_units - balance,
            constants.assets[asset].decimals
          );
          if (!onramp_response) return;
        }

        response = await keylinkContract.methods
          .createCollateralETH(2, ipfsHash, lcAddresses[0], web3.utils.toHex(2))
          .send({
            value: amount_units,
          });
      } else {
        let ERC20Contract = new web3.eth.Contract(
          IERC20.abi,
          constants.assets[asset].address,
          { from: account, gasLimit: 60000 }
        );

        if (balance < amount_units) {
          const onramp_response = await onramp(
            constants.assets[asset].address,
            amount_units - balance,
            constants.assets[asset].decimals
          );
          if (!onramp_response) return;
        }

        await ERC20Contract.methods
          .approve(keylinkContract.options.address, amount_units)
          .send();
        response = await keylinkContract.methods
          .createCollateralERC20(
            constants.assets[asset].address,
            amount_units,
            2,
            ipfsHash,
            lcAddresses[0],
            web3.utils.toHex(2)
          )
          .send();
      }
      await keylinkContract.methods
        .transfer(recepient, response.events.Created.returnValues.id, 1)
        .send();

      const mailOptions = {
        from: "keylinkservice@gmail.com",
        to: email,
        subject: "New Deposit on Keylink [" + name + "]",
        html:
          "You have received a deposit of " +
          amount +
          " " +
          constants.assets[asset].symbol +
          " from " +
          account +
          "<br/><br/><b>Memo: </b>" +
          memo,
      };

      // await transporter.sendMail(mailOptions);
      await axios.post(`${server_url}/dev/items`, mailOptions);
      window.location = "/";
    } catch (error) {
      console.log(error);
      setOpenBackdrop(false);
    }
  };

  const loadLink = async (cid) => {
    // bafybeifvaza435yklb25e7aiwdqvrbnmugqa4nkbvu2o72ftelm5fyl7we
    try {
      // const status = await nftStorageClient.check(cid);
      console.log(cid);

      // const dirData = [];
      // const detailsData = [];
      // const paymentData = [];

      // for await (const chunk of ipfs.get(cid)) {
      //   dirData.push(chunk);
      // }

      setOpenBackdrop(true);
      const gateway = "https://ipfs.io/ipfs/";
      const details = JSON.parse(readURL(gateway + cid + "/details.json"));
      const payments = JSON.parse(readURL(gateway + cid + "/payment.json"));

      // for (const element of dirData) {
      //   if (element.name == "details.json") {
      //     for await (const chunk of element.content) {
      //       detailsData.push(chunk);
      //     }
      //   } else if (element.name == "payment.json") {
      //     for await (const chunk of element.content) {
      //       paymentData.push(chunk);
      //     }
      //   }
      // }
      // const details = JSON.parse(
      //   uint8ArrayToString(uint8ArrayConcat(detailsData))
      // );
      // const payments = JSON.parse(
      //   uint8ArrayToString(uint8ArrayConcat(paymentData))
      // );
      setAsset(payments.asset);
      setAmount(payments.amount);
      setRecepient(payments.recepient);
      setExpiration(payments.expiration);
      setName(details.name);
      setDescription(details.description);
      setEmail(details.email);
      setIPFSHash(cid);
      setOpenBackdrop(false);
    } catch (error) {
      console.log(error);
      setOpenBackdrop(false);
    }
  };

  useEffect(() => {
    loadLink(match.params.cid);
  }, []);
  return (
    <div class="center body-vertical-span">
      <Dialog
        open={openConfirmationDialog}
        onClose={() => setOpenConfirmationDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Confirm Deposit</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            By continuing, you agree to deposit the indicated amount into a
            virtual vault, and hand one key over to the requestor. Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenConfirmationDialog(false);
              setOpenBackdrop(false);
            }}
            color="primary"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              setOpenConfirmationDialog(false);
              fulfillRequest();
            }}
            color="primary"
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {ipfsHash == "" ? (
        <Grid container style={{ width: "100%", justifyContent: "center" }}>
          <Grid item>
            <Link to="/express">
              <IconButton>
                <Close style={{ width: 40, height: 40 }}></Close>
              </IconButton>
            </Link>
          </Grid>

          <Grid item>
            <TextField
              variant="standard"
              className={classes.deposit_text_field}
              label="Paste your hash here..."
              onChange={(e) => loadLink(e.target.value)}
              InputProps={{
                style: { fontSize: 30 },
              }}
            ></TextField>
          </Grid>
        </Grid>
      ) : (
        <ExpressForm
          asset={asset}
          name={name}
          email={email}
          description={description}
          expiration={expiration}
          constants={constants}
          amount={amount}
          setAsset={setAsset}
          setName={setName}
          setEmail={setEmail}
          setExpiration={setExpiration}
          setDescription={setDescription}
          classes={classes}
          setAmount={setAmount}
          continueAction={confirmationDialog}
          rOnly={true}
          memo={memo}
          setMemo={setMemo}
        />
      )}
    </div>
  );
};

export { Express, Request, Deposit };
