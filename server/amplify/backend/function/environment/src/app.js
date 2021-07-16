/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

var express = require("express");
var bodyParser = require("body-parser");
var awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");

// declare a new express app
var app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

/**********************
 * Example get method *
 **********************/

app.get("/environment", function (req, res) {
  // Add your code here
  res.json({
    waitTime: {
      97: "3 seconds",
      4: "15 seconds",
      80001: "3 seconds",
    },

    waitMessage: [
      "Dialing up Satoshi Nakamoto...",
      "Awaiting transaction confirmation...",
      "Awaiting transaction confirmation...",
      "Awaiting transaction confirmation...",
      "Awaiting transaction confirmation...",
      "Awaiting transaction confirmation...",
      "Awaiting transaction confirmation...",
      "Awaiting transaction confirmation...",
      "Awaiting transaction confirmation...",
      "Awaiting transaction confirmation...",
      "Awaiting transaction confirmation...",
      "Solving cryptographic hash...",
      "Broadcasting to blockchain...",
      "Awaiting consensus from all nodes...",
      "Solving cryptographic hash...",
      "Broadcasting to blockchain...",
      "Awaiting consensus from all nodes...",
    ],

    tokenAddresses: {
      97: [
        {
          address: "0x74e6d184a8cd7d43e9b2b46b66f6eb92d36a768b",
          name: "U.S. Dollar Coin",
          symbol: "USDC",
          decimals: 18,
          icon: "https://etherscan.io/token/images/centre-usdc_28.png",
        },
        {
          address: "0x0266693f9df932ad7da8a9b44c2129ce8a87e81f",
          name: "Binance USD",
          symbol: "BUSD",
          decimals: 18,
          icon: "https://etherscan.io/token/images/binanceusd_32.png",
        },
      ],

      80001: [
        {
          address: "0x234201E48499b104321CB482BeB5A7ae5F3d9627",
          name: "U.S. Dollar Coin",
          symbol: "USDC",
          decimals: 18,
          icon: "https://etherscan.io/token/images/centre-usdc_28.png",
        },
      ],
      4: [
        {
          address: "0xeb8f08a975ab53e34d8a0330e0d34de942c95926",
          name: "U.S. Dollar Coin",
          symbol: "USDC",
          decimals: 18,
          icon: "https://etherscan.io/token/images/centre-usdc_28.png",
        },
      ],
      56: [
        {
          address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
          name: "U.S. Dollar Coin",
          symbol: "USDC",
          decimals: 18,
          icon: "https://etherscan.io/token/images/centre-usdc_28.png",
        },
        {
          address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
          name: "Binance USD",
          symbol: "BUSD",
          decimals: 18,
          icon: "https://etherscan.io/token/images/binanceusd_32.png",
        },
      ],
    },
    lcAddresses: {
      97: [
        {
          address: "0xbc1410fA0E6056522Ed939885414337731802e16",
          name: "Own set number of keys",
          id: 0,
        },
      ],
      4: [
        {
          address: "0xd6743dacc46D942199361D97E4A3930f3b0Ef42F",
          name: "Own set number of keys",
          id: 0,
        },
      ],
      56: [
        {
          address: "0x4459637A88799815832ebe7f536271094E4A3d9c",
          name: "Own set number of keys",
          id: 0,
        },
      ],
      80001: [
        {
          address: "0x62bC34a11cA2C71B049CA6bB62a9eeFbe8AA4fa2",
          name: "Own set number of keys",
          id: 0,
        },
      ],
    },

    nativeTokens: {
      1: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        icon: "https://etherscan.io/images/main/empty-token.png",
      },
      4: {
        name: "Ether",
        symbol: "ETH",
        decimals: 18,
        icon: "https://etherscan.io/images/main/empty-token.png",
      },
      97: {
        name: "Binance Coin",
        symbol: "BNB",
        decimals: 18,
        icon: "https://etherscan.io/token/images/bnb_28_2.png",
      },
      56: {
        name: "Binance Coin",
        symbol: "BNB",
        decimals: 18,
        icon: "https://etherscan.io/token/images/bnb_28_2.png",
      },
      137: {
        name: "MATIC Token",
        symbol: "MATIC",
        decimals: 18,
        icon: "https://etherscan.io/token/images/matic-polygon_32.png",
      },
      80001: {
        name: "MATIC Token",
        symbol: "MATIC",
        decimals: 18,
        icon: "https://etherscan.io/token/images/matic-polygon_32.png",
      },
    },
  });
});

app.listen(3000, function () {
  console.log("App started");
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app;
