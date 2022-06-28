import fs from 'fs';
import path from 'path';
import dotenv from "dotenv";
import { providers, Contract } from "ethers";
import tokenInterface from "../src/tokenInterface.json";
import opTokenList from "../optimism.tokenlist.json";
// TODO this needs to go
import newTokenFile from '../projects/standard-bridge/example.json';

var args = process.argv.slice(2);

// FUTURE add flag to validate a single project passed in or all projects

export const network = {
  MAINNET: 1,
  OP_MAINNET: 10,
  KOVAN: 42,
  OP_KOVAN: 69
};

const networkMainnet = 1;
const networkOptimism = 10;
const networkKovan = 42;
const networkOpKovan = 69;

export const oppositeChainIdMap = {
  [network.MAINNET]: network.OP_MAINNET,
  [network.KOVAN]: network.OP_KOVAN,
  [network.OP_MAINNET]: network.MAINNET,
  [network.OP_KOVAN]: network.KOVAN
};

export const chainIdLayerMap = {
  [network.MAINNET]: 1,
  [network.KOVAN]: 1,
  [network.OP_MAINNET]: 2,
  [network.OP_KOVAN]: 2
};

const infuraKey = process.env.INFURA_KEY || "84842078b09946638c03157f83405213";

const networkURLMap = {
  1: `https://mainnet.infura.io/v3/${infuraKey}`,
  10: `https://mainnet.optimism.io`,
  42: `https://kovan.infura.io/v3/${infuraKey}`,
  69: `https://kovan.optimism.io`
};

const networkMap = {
  1: "Mainnet",
  10: "Optimistic Ethereum",
  42: "Kovan",
  69: "Optimistic Kovan"
};

let projectTokens = {
  mainnet: [],
  optimism: [],
  kovan: [],
  opKovan: []
};

async function main() {
  console.log(args)

  // TODO get file in here
  let newToken = newTokenFile;
  
  let configuration = [];
  
  // Getting onchain info
  for (const token of newToken.tokens) {
    let tokenInfo = {
      chainId: token.chainId,
      address: token.address,
      name: "",
      symbol: "",
      decimals: "",
      logoURI: newToken.logoURI,
      extensions: ""
    };

    const result = opTokenList.tokens.find( ({ address }) => address === token.address );
    if(result != undefined) {
      throw Error("Token address already listed! Please use update not add.");
    }

    console.log("Fetch: Info for token " + token.address + " on chain ID " + token.chainId);

    configuration.push(tokenInfo.chainId);

    const currentNetwork = networkURLMap[tokenInfo.chainId];
    const currentChainProvider = new providers.JsonRpcProvider(currentNetwork);

    const contract = new Contract(
      tokenInfo.address,
      tokenInterface,
      currentChainProvider
    );

    let onchainName = "";
    let onchainSymbol = "";
    let onchainDecimals = "";

    try {
      onchainName = await contract.name();
      onchainSymbol = await contract.symbol();
      onchainDecimals = await contract.decimals();

      tokenInfo.name = onchainName;
      tokenInfo.symbol = onchainSymbol;
      tokenInfo.decimals = onchainDecimals;
    } catch (error) {
      throw Error("Unable to fetch token name, symbol or decimal. " + 
      "\nPotential Fix: Ensure your token contract conforms to the ERC20 standard. " + 
      "Check your network and token addresses match. " + 
      "For non-standard tokens please make a custom token request.");
    }

    // TODO check token complies with ERC20 

    switch (tokenInfo.chainId) {
      case 1:
        projectTokens.mainnet.push(tokenInfo);
        break;
      case 10:
        projectTokens.optimism.push(tokenInfo);
        break;
      case 42: 
        projectTokens.kovan.push(tokenInfo);
        break;
      case 69: 
        projectTokens.opKovan.push(tokenInfo);
        break;
      default:
        throw Error("Unsupported network provided");
        break;
    }
    console.log("Success: Pulled token information.");
  };

  console.log(projectTokens);

  const validConfigurations = {
    testing: [42, 69],
    full: [1, 10, 42, 69],
    unbridgeable: [10, 69]
  };

  // Checking config is valid
  if(configuration.length == 2) {
    if(configuration[0] == 42 && configuration[1] == 69) {
      console.log("Success: Token configuration valid. Configuration: Testing");
    } else if(configuration[0] == 10 && configuration[1] == 69) {
      console.log("Success: Token configuration valid. Configuration: Unbridgeable");
    } else {
      throw Error("Invalid config.\nPotential Fix: Two token configurations can either be " +
      "unbridgeable or testing. For more information see the standard bridge README");
    }
  } else if(
    configuration.length == 4 &&
    configuration[0] == 1 &&
    configuration[0] == 10 &&
    configuration[0] == 42 &&
    configuration[0] == 96
  ) {

  } else {
    throw Error("Invalid config.\nPotential Fix: Please see acceptable configs in the standard bridge README");
  }
  
  // writeFile(newToken, newToken); 
}

function readFile(path: any) {
  try {
    fs.readFileSync(path, {encoding:'utf8', flag:'r'});
  } catch (err) {
    console.log(err);
    return 'Something went wrong reading the file.';
  }
}

function writeFile(path: any, data: any) {
  try {
      let stringData = JSON.stringify(data)
      fs.writeFileSync(path, stringData, {
      flag: 'w',
    });
  } catch (err) {
    console.log(err);
    return 'Something went wrong';
  }
}

function checkConfig(tokens: Array<TokenListing>) {
  if(tokens.length > 4) {
    throw Error("Max tokens provided is greater than 4.\n" + 
      "Potential Fix: There are only 4 valid chains for token listing. " + 
      "Ethereum mainnet, Optimism mainnet, Kovan testnet and Optimism Kovan testnet. " +
      "Please check your provided addresses and make the necessary corrections."
    );
  } else if(tokens.length == 4) {
    if(
      tokens[0].chainId == network.MAINNET &&
      tokens[1].chainId == network.OP_MAINNET &&
      tokens[2].chainId == network.KOVAN &&
      tokens[3].chainId == network.OP_KOVAN 
    ) {
      console.log("Success: Token configuration valid. Configuration: Full token suit");
    } else {
      throw Error("Tokens provided are not a valid configuration\n" + 
        "Potential Fix: Please see the README for valid token network configurations."
      );
    }
  } else if(tokens.length == 2) {
    if(
      tokens[0].chainId == network.OP_MAINNET &&
      tokens[1].chainId == network.OP_KOVAN
    ) {
      console.log("Success: Token configuration valid. Configuration: Unbridgeable");
    } else if(
      tokens[0].chainId == network.KOVAN &&
      tokens[1].chainId == network.OP_KOVAN
    ) {
      console.log("Success: Token configuration valid. Configuration: Testing");
    } else {
      throw Error("Tokens provided are not a valid configuration\n" + 
        "Potential Fix: Please see the README for valid token network configurations."
      );
    }
  } else {
    throw Error("Tokens provided are not a valid configuration\n" + 
      "Potential Fix: Please see the README for valid token network configurations."
    );
  }
}

main()
  .then(() => {
    console.log("\nToken list validated!\n");
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });