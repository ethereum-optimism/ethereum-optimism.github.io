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

enum validConfiguration {
  testing,
  fullSuite,
  unbridgeable
}

const validConfigurations = {
  testing: [42, 69],
  fullSuite: [1, 10, 42, 69],
  unbridgeable: [10, 69]
};

const infuraKey = process.env.INFURA_KEY || "84842078b09946638c03157f83405213";

const factoryDeployer:string = "0x4200000000000000000000000000000000000012";

const standardBridgeAddress = {
  1: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
  10: "0x4200000000000000000000000000000000000010",
  42: "0x22F24361D548e5FaAfb36d1437839f080363982B",
  69: "0x4200000000000000000000000000000000000010"
}

const networkURLMap = {
  1: `https://mainnet.infura.io/v3/${infuraKey}`,
  10: `https://mainnet.optimism.io`,
  42: `https://kovan.infura.io/v3/${infuraKey}`,
  69: `https://kovan.optimism.io`
};

const extensions = {
  1: `{"optimismBridgeAddress":"${standardBridgeAddress[1]}"}`,
  10: `{"optimismBridgeAddress":"${standardBridgeAddress[10]}"}`,
  42: `{"optimismBridgeAddress":"${standardBridgeAddress[42]}"}`,
  69: `{"optimismBridgeAddress":"${standardBridgeAddress[69]}"}`
}

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

  let tokenChains:Array<number> = new Array;
  for(const token of newToken.tokens) {
    tokenChains.push(token.chainId);
  }
  let tokenOrdering:validConfiguration = checkConfig(tokenChains);
  console.log(tokenOrdering);

  // Getting onchain info
  let formattedTokens:Array<TokenListing> = new Array;
  for (const token of newToken.tokens) {
    let onchainListing: TokenListing = {
      chainId: token.chainId,
      address: token.address,
      name: "",
      symbol: "",
      decimals: 0,
      logoURI: newToken.logoURI,
      factoryDeployed: false
    };
    onchainListing = await getOnchainInfo(onchainListing);
    onchainListing = await setBridgeAddresses(onchainListing, tokenOrdering);

    formattedTokens.push(onchainListing);
  }

  let formattedFile = formatFile(newToken, formattedTokens);
  // console.log(formattedTokens);
  console.log(formattedFile);

  // const result = opTokenList.tokens.find( ({ address }) => address === token.address );
  // if(result != undefined) {
  //   // TODO check if info is the same in case script has been run before
  //   throw Error("Token address already listed! Please use update not add.");
  // }

  // Checking config is valid
  // A valid config is defined in the README as one of three:
  // - Testing (Kovan & Optimism Kovan)
  // - Unbridgeable (Optimism & Optimism Kovan)
  // - Full suite (Ethereum mainnet, Optimism, Kovan & Optimism Kovan)
  // Any other configuration will result in a detailed error message.
  // checkConfig([projectTokenKovan, projectTokenOpKovan]);

  // Writes verified data to file.

  writeFile("./projects/standard-bridge/example.json", formattedFile);
}

function formatFile(
  originalFile: any,
  tokens: Array<TokenListing>
):string {
  let formattedTokens = ``;
  // tokens.forEach(token => {
  //   let formattedToken:string = formatToken(token);
  //   formattedTokens = formattedTokens + `${formattedToken},`
  // });
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    let formattedToken:string = formatToken(token);
    if(index != tokens.length) {
      formattedTokens = formattedTokens + `${formattedToken},`
    } else {
      formattedTokens = formattedTokens + `${formattedToken}`
    }
  }
  // console.log(formattedTokens);

  let fullFile = `
    {
      "name": "${originalFile.name}",
      "website": "${originalFile.website}",
      "twitter": "${originalFile.twitter}",
      "logoURI": "${originalFile.logoURI}",
      "description": "${originalFile.description}",
      "tokens": [
        ${formattedTokens}
      ]
    }
  `;
  return fullFile;
}

function formatToken(
  token: TokenListing
):string {
  let formattedToken = `
    {
      "chainId": ${token.chainId},
      "address": "${token.address}",
      "name": "${token.name}",
      "symbol": "${token.symbol}",
      "decimals": ${token.decimals},
      "logoURI": "${token.logoURI}",
  `;

  if(token.extensions != undefined) {
    formattedToken = formattedToken + `"extensions": ${token.extensions}}`
  } else {
    formattedToken = formattedToken + `}`;
  }
  return formattedToken;
}

async function setBridgeAddresses(
  onchainListing: TokenListing,
  tokenConfig: validConfiguration
): Promise<TokenListing> {
  if(tokenConfig == validConfiguration.unbridgeable) {
    return onchainListing;
  } else if(tokenConfig == validConfiguration.testing) {
    if(
      onchainListing.chainId == network.KOVAN || 
      onchainListing.chainId == network.OP_KOVAN
    ) {
      onchainListing.extensions = extensions[onchainListing.chainId];
    } else {
      throw Error("Unsupported network");
    }
  } else if(tokenConfig == validConfiguration.fullSuite) {
    if(
      onchainListing.chainId == network.MAINNET || 
      onchainListing.chainId == network.OP_MAINNET || 
      onchainListing.chainId == network.KOVAN || 
      onchainListing.chainId == network.OP_KOVAN
    ) {
      onchainListing.extensions = extensions[onchainListing.chainId];
    } else {
      throw Error("Unsupported network");
    }
  }
  return onchainListing;
}

async function getOnchainInfo(onchainListing: TokenListing): Promise<TokenListing> {
  if (
    onchainListing.chainId != network.MAINNET &&
    onchainListing.chainId != network.OP_MAINNET &&
    onchainListing.chainId != network.KOVAN &&
    onchainListing.chainId != network.OP_KOVAN
  ) {
    throw Error("Chain ID provided is invalid.");
  }

  console.log(
    "Fetch: Info for token " + onchainListing.address + " on " + networkMap[onchainListing.chainId]
  );

  const currentNetwork = networkURLMap[onchainListing.chainId];
  const currentChainProvider = new providers.JsonRpcProvider(currentNetwork);

  const contract = new Contract(
    onchainListing.address,
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

  let deployerAddress = await getContractDeployer(
    onchainListing.address,
    onchainListing.chainId
  );

  if(
    (onchainListing.chainId == network.OP_MAINNET || 
    onchainListing.chainId == network.OP_KOVAN) &&
    deployerAddress == factoryDeployer
  ) {
    onchainListing.factoryDeployed = true;
    console.log("Success: Token was deployed by factory on L2."); 
  } else if(
    onchainListing.chainId == network.MAINNET || 
    onchainListing.chainId == network.KOVAN
  ) { 
    onchainListing.factoryDeployed = true;
    console.log("Deployed on an L1");
  } else {
    throw Error("Token not deployed by ERC20 factory.\n" + 
      "Potential Fix: Please use the appropriate token adder as specified in the base README."
    );
  }
  return onchainListing;
}

function checkConfig(tokens: Array<number>): validConfiguration {
  if (tokens.length > 4) {
    throw Error(
      "Max tokens provided is greater than 4.\n" +
        "Potential Fix: There are only 4 valid chains for token listing. " +
        "Ethereum mainnet, Optimism mainnet, Kovan testnet and Optimism Kovan testnet. " +
        "Please check your provided addresses and make the necessary corrections."
    );
  } else if (tokens.length == 4) {
    if (
      tokens[0] == network.MAINNET &&
      tokens[1] == network.OP_MAINNET &&
      tokens[2] == network.KOVAN &&
      tokens[3] == network.OP_KOVAN
    ) {
      console.log(
        "Success: Token configuration valid. Configuration: Full token suit"
      );
      return validConfiguration.fullSuite;
    } else {
      throw Error(
        "Tokens provided are not a valid configuration\n" +
          "Potential Fix: Please see the README for valid token network configurations."
      );
    }
  } else if (tokens.length == 2) {
    if (
      tokens[0] == network.OP_MAINNET &&
      tokens[1] == network.OP_KOVAN
    ) {
      console.log(
        "Success: Token configuration valid. Configuration: Unbridgeable"
      );
      return validConfiguration.unbridgeable;
    } else if (
      tokens[0] == network.KOVAN &&
      tokens[1] == network.OP_KOVAN
    ) {
      console.log("Success: Token configuration valid. Configuration: Testing");
      return validConfiguration.testing;
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
    throw Error("Unable to read file.\n" + 
      "Potential Fix: Please ensure your file is named correctly and located in the correct folder."
    );
  }
}

function writeFile(path: any, data: string) {
  try {
    fs.writeFileSync(path, data, {
      flag: "w"
    });
  } catch (err) {
    throw Error("Unable to write to file.\n" + 
      "Potential Fix: Please ensure your file is named correctly and located in the correct folder."
    );
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
