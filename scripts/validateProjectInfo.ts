import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { providers, Contract } from "ethers";
import tokenInterface from "../src/tokenInterface.json";
import opTokenList from "../optimism.tokenlist.json";
// TODO this needs to go
import newTokenFile from "../projects/standard-bridge/example.json";
import fetch from "node-fetch";

// var args = process.argv.slice(2);

// FUTURE add flag to validate a single project passed in or all projects

export const network = {
  MAINNET: 1,
  OP_MAINNET: 10,
  KOVAN: 42,
  OP_KOVAN: 69
};

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

const factoryDeployer:string = "0x4200000000000000000000000000000000000012";

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

type TokenListing = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  factoryDeployed: Boolean;
  extensions?: string;
};

async function main() {
  // console.log(args)

  // TODO get file in here
  // let filePath = './projects/standard-bridge/' + args[1];
  // console.log(filePath)
  // let resolvedPath = path.resolve(filePath);
  // readFile(resolvedPath);
  // const recipientsObject = JSON.parse(fs.readFileSync(options.input, { encoding: "utf8" }));
  // Getting their supplied token data
  let newToken = newTokenFile;

  // TODO verify off chain data

  // Getting onchain info
  for (const token of newToken.tokens) {
    // let onchainListing:TokenListing =
    await getOnchainInfo(token.chainId, token.address, newToken.logoURI);

    // console.log(token)
    // console.log(onchainListing)

    // const result = opTokenList.tokens.find( ({ address }) => address === token.address );
    // if(result != undefined) {
    //   // TODO check if info is the same in case script has been run before
    //   throw Error("Token address already listed! Please use update not add.");
    // }
  }

  // Checking config is valid
  // A valid config is defined in the README as one of three:
  // - Testing (Kovan & Optimism Kovan)
  // - Unbridgeable (Optimism & Optimism Kovan)
  // - Full suite (Ethereum mainnet, Optimism, Kovan & Optimism Kovan)
  // Any other configuration will result in a detailed error message.
  // checkConfig([projectTokenKovan, projectTokenOpKovan]);

  // Writes verified data to file.
  // writeFile("./projects/standard-bridge/example.json", newToken);
}

async function getOnchainInfo(
  chainId: number,
  tokenAddress: string,
  logoURI: string
): Promise<TokenListing> {
  let onchainListing: TokenListing = {
    chainId: chainId,
    address: tokenAddress,
    name: "",
    symbol: "",
    decimals: 0,
    logoURI: logoURI,
    factoryDeployed: false
  };

  if (
    chainId != network.MAINNET &&
    chainId != network.OP_MAINNET &&
    chainId != network.KOVAN &&
    chainId != network.OP_KOVAN
  ) {
    throw Error("Chain ID provided is invalid.");
  }

  console.log(
    "Fetch: Info for token " + tokenAddress + " on " + networkMap[chainId]
  );

  const currentNetwork = networkURLMap[chainId];
  const currentChainProvider = new providers.JsonRpcProvider(currentNetwork);

  const contract = new Contract(
    tokenAddress,
    tokenInterface,
    currentChainProvider
  );

  try {
    onchainListing.name = await contract.callStatic.name();
    onchainListing.symbol = await contract.symbol();
    onchainListing.decimals = Number(await contract.decimals());
  } catch (error) {
    console.log(error);
    throw Error(
      "Unable to fetch token name, symbol or decimal. " +
        "\nPotential Fix: Ensure your token contract conforms to the ERC20 standard. " +
        "Check the provided token exists on the given network. " +
        "For non-standard tokens please make a custom token request."
    );
  }
  console.log("Success: Pulled token information.");

  let result = await getContractDeployer(
    onchainListing.address,
    onchainListing.chainId
  );
  console.log(result);

  if(result == factoryDeployer) {
    
  }

  console.log(onchainListing);
  return onchainListing;
}

function checkConfig(tokens: Array<TokenListing>) {
  if (tokens.length > 4) {
    throw Error(
      "Max tokens provided is greater than 4.\n" +
        "Potential Fix: There are only 4 valid chains for token listing. " +
        "Ethereum mainnet, Optimism mainnet, Kovan testnet and Optimism Kovan testnet. " +
        "Please check your provided addresses and make the necessary corrections."
    );
  } else if (tokens.length == 4) {
    if (
      tokens[0].chainId == network.MAINNET &&
      tokens[1].chainId == network.OP_MAINNET &&
      tokens[2].chainId == network.KOVAN &&
      tokens[3].chainId == network.OP_KOVAN
    ) {
      console.log(
        "Success: Token configuration valid. Configuration: Full token suit"
      );
    } else {
      throw Error(
        "Tokens provided are not a valid configuration\n" +
          "Potential Fix: Please see the README for valid token network configurations."
      );
    }
  } else if (tokens.length == 2) {
    if (
      tokens[0].chainId == network.OP_MAINNET &&
      tokens[1].chainId == network.OP_KOVAN
    ) {
      console.log(
        "Success: Token configuration valid. Configuration: Unbridgeable"
      );
    } else if (
      tokens[0].chainId == network.KOVAN &&
      tokens[1].chainId == network.OP_KOVAN
    ) {
      console.log("Success: Token configuration valid. Configuration: Testing");
    } else {
      throw Error(
        "Tokens provided are not a valid configuration\n" +
          "Potential Fix: Please see the README for valid token network configurations."
      );
    }
  } else {
    throw Error(
      "Tokens provided are not a valid configuration\n" +
        "Potential Fix: Please see the README for valid token network configurations."
    );
  }
}

function readFile(path: any) {
  try {
    fs.readFileSync(path, { encoding: "utf8", flag: "r" });
  } catch (err) {
    console.log(err);
    // TODO throw a real error
    return "Something went wrong reading the file.";
  }
}

function writeFile(path: any, data: any) {
  try {
    let stringData = JSON.stringify(data);
    fs.writeFileSync(path, stringData, {
      flag: "w"
    });
  } catch (err) {
    console.log(err);
    // TODO throw a real error
    return "Something went wrong";
  }
}

async function getContractDeployer(
  address: string,
  chainId: number
): Promise<string> {
  const url = {
    1: `https://etherscan.io/address/${address}`,
    10: `https://optimistic.etherscan.io/address/${address}`,
    42: `https://kovan.etherscan.io/address/${address}`,
    69: `https://kovan-optimistic.etherscan.io/address/${address}`
  };

  const response = await fetch(url[chainId]);
  const body = await response.text();
  const searchTerm = "Creator Address'>";
  const index = body.indexOf(searchTerm);
  const deployerAddress = body.substring(
    index + searchTerm.length,
    index + 42 + searchTerm.length
  );
  return deployerAddress.includes("GENESIS") ? "GENESIS" : deployerAddress;
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
