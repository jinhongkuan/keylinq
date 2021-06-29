import React, { useState, useEffect, Component } from "react";
import CollaterizeContract from "./contracts/Collaterize.json";
import ILiquidationCheck from "./contracts/ILiquidationCheck.json";
import CountLiquidationCheck from "./contracts/CountLiquidationCheck.json";

import IERC20 from "./contracts/IERC20.json";
import IERC20Metadata from "./contracts/IERC20Metadata.json";
import TestERC20 from "./contracts/ERC20.json";
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

import { IconButton } from "@material-ui/core";

const Contracting = ({ setPage }) => {
  useEffect(() => {
    (async () => {
      setPage("Contracts");
    })();
  }, []);

  return <div>hello</div>;
};

export default Contracting;
