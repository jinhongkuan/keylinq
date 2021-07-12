exports.handler = async (event) => {
  // TODO implement
  const response = {
    statusCode: 200,
    //  Uncomment below to enable CORS requests
    //  headers: {
    //      "Access-Control-Allow-Origin": "*",
    //      "Access-Control-Allow-Headers": "*"
    //  },
    body: {
      // tokenAddresses: {
      //   97: {
      //     "U.S. Dollar Coin": "0x74e6d184a8cd7d43e9b2b46b66f6eb92d36a768b",
      //     "Binance USD": "0x0266693f9df932ad7da8a9b44c2129ce8a87e81f",
      //   },
      //   80001: {
      //     "U.S. Dollar Coin": "0x234201E48499b104321CB482BeB5A7ae5F3d9627",
      //   },
      //   4: {
      //     "U.S. Dollar Coin": "0xeb8f08a975ab53e34d8a0330e0d34de942c95926",
      //   },
      // },
      tokenAddresses: {
        97: [
          "0x74e6d184a8cd7d43e9b2b46b66f6eb92d36a768b",
          "0x0266693f9df932ad7da8a9b44c2129ce8a87e81f",
        ],

        80001: ["0x234201E48499b104321CB482BeB5A7ae5F3d9627"],
        4: ["0xeb8f08a975ab53e34d8a0330e0d34de942c95926"],
      },
      lcAddresses: {
        Name: ["Unlock with all keys"],
        97: ["0xbc1410fA0E6056522Ed939885414337731802e16"],
        4: ["0xd6743dacc46D942199361D97E4A3930f3b0Ef42F"],
        80001: ["0x62bC34a11cA2C71B049CA6bB62a9eeFbe8AA4fa2"],
      },

      nativeTokens: {
        1: "ETH",
        3: "ETH",
        97: "BNB",
        137: "MATIC",
        80001: "MATIC",
      },

      nativeTokenNames: {
        1: "Ether",
        3: "Ether",
        97: "Binance Coin",
        137: "MATIC Token",
        80001: "MATIC Token",
      },
    },
  };
  return response;
};
