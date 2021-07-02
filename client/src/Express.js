import React, { useState, useEffect, Component } from "react";
import CollaterizeContract from "./contracts/Collaterize.json";
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
import PaymentIcon from "@material-ui/icons/Payment";
import TextField from "@material-ui/core/TextField";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import { withStyles } from "@material-ui/core/styles";
import PropTypes from "prop-types";

import { IconButton } from "@material-ui/core";
import { readURL } from "./utils";
const WhiteTypography = withStyles({
  root: {
    color: "#FFFFFF",
  },
})(Typography);

const secret = require("./secret.json");
const nftStorageClient = new NFTStorage({ token: secret.nftstorage_api });
const uint8ArrayConcat = require("uint8arrays/concat");
const uint8ArrayToString = require("uint8arrays/to-string");

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
          <Grid container item>
            <Link to="/deposit" style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                color="primary"
                style={{ width: 150 }}
              >
                <PaymentIcon style={{ padding: 5 }}></PaymentIcon>
                Deposit
              </Button>
            </Link>
          </Grid>
          <Grid container item>
            <Grid item>
              <Link to="/request" style={{ textDecoration: "none" }}>
                <Button
                  variant="contained"
                  color="primary"
                  style={{ width: 150 }}
                >
                  <ListAlt style={{ padding: 5 }}></ListAlt>
                  Request
                </Button>
              </Link>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </div>
  );
};

const Request = ({ classes, constants, setOpenBackdrop, account }) => {
  const [asset, setAsset] = useState("Ether");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
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
            service: "Express",
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
          amount={amount}
          setAsset={setAsset}
          setName={setName}
          setEmail={setEmail}
          setDescription={setDescription}
          classes={classes}
          setAmount={setAmount}
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
  setAsset,
  setName,
  setEmail,
  setDescription,
  classes,
  setAmount,
  continueAction,
  rOnly,
}) => {
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
                        Powered by <b>Keylink</b>
                      </WhiteTypography>
                    </Box>
                  </div>
                </div>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>
                <FormControl>
                  <TextField
                    label=""
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    inputProps={{
                      readOnly: rOnly,
                    }}
                  ></TextField>
                </FormControl>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Description</TableCell>
              <TableCell>
                <FormControl>
                  <TextField
                    label=""
                    value={description}
                    multiline
                    rows={3}
                    onChange={(e) => setDescription(e.target.value)}
                    inputProps={{
                      readOnly: rOnly,
                    }}
                  ></TextField>
                </FormControl>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>
                <FormControl>
                  <TextField
                    label=""
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    inputProps={{
                      readOnly: rOnly,
                    }}
                  ></TextField>
                </FormControl>
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
                    inputProps={{
                      readOnly: rOnly,
                    }}
                  ></TextField>
                </FormControl>
              </TableCell>
            </TableRow>

            <TableRow>
              <TableCell>Assets</TableCell>
              <TableCell>
                {rOnly ? (
                  <TextField
                    label=""
                    value={asset}
                    inputProps={{
                      readOnly: rOnly,
                    }}
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
  const [asset, setAsset] = useState("Ether");
  const [name, setName] = useState("");
  const [recepient, setRecepient] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState(0);
  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);
  const confirmationDialog = async () => {
    setOpenBackdrop(true);
    setOpenConfirmationDialog(true);
  };

  const fulfillRequest = async () => {
    try {
      let response;
      if (constants.assets[asset].address == "NATIVE") {
        response = await keylinkContract.methods
          .createCollateralETH(2, ipfsHash, lcAddresses[0], web3.utils.toHex(2))
          .send({
            value: Math.ceil(
              amount * Math.pow(10, constants.assets[asset].decimals)
            ),
          });
      } else {
        let am = Math.ceil(
          amount * Math.pow(10, constants.assets[asset].decimals)
        ).toString();

        let ERC20Contract = new web3.eth.Contract(
          IERC20.abi,
          constants.assets[asset].address,
          { from: account, gasLimit: 60000 }
        );
        await ERC20Contract.methods
          .approve(keylinkContract.options.address, am)
          .send();
        response = await keylinkContract.methods
          .createCollateralERC20(
            constants.assets[asset].address,
            am,
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
      const gateway = "http://ipfs.io/ipfs/";
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
          constants={constants}
          amount={amount}
          setAsset={setAsset}
          setName={setName}
          setEmail={setEmail}
          setDescription={setDescription}
          classes={classes}
          setAmount={setAmount}
          continueAction={confirmationDialog}
          rOnly={true}
        />
      )}
    </div>
  );
};

export { Express, Request, Deposit };
