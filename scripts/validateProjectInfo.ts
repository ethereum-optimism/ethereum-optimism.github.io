import fs from "fs";
import path from "path";
import { providers, Contract } from "ethers";
import tokenInterface from "../src/tokenInterface.json";
import fetch from "node-fetch";
import {
  infuraKey,
  factoryDeployer,
  network,
  oppositeChainIdMap,
  chainIdLayerMap,
  validConfiguration,
  validConfigurations,
  standardBridgeAddress,
  extensions,
  networkURLMap,
  networkMap,
  TokenListing,
  filePath,
  readFile,
  writeFile
} from "./utils";
import dotenv from "dotenv";
dotenv.config();

// FUTURE add flag to validate a single project passed in or all projects

async function main() {
  let fileName = process.env.PROJECT_FILE_NAME;
  let projectFilePath = filePath + fileName + '/';;
  let projectInfoPath = projectFilePath + '/projectInfo.json';
  let resolvedPath = path.resolve(projectInfoPath);
  let receivedFile = readFile(resolvedPath);
  let newToken = JSON.parse(receivedFile);

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

  let verifiedProjectInfo = filePath + 'verifiedProjectInfo.json';
  console.log(verifiedProjectInfo)

  writeFile(verifiedProjectInfo, formattedFile);
}

function formatFile(
  originalFile: any,
  tokens: Array<TokenListing>
):string {
  let formattedTokens = ``;
  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index];
    let formattedToken:string = formatToken(token);
    if(index != tokens.length) {
      formattedTokens = formattedTokens + `${formattedToken},`
    } else {
      formattedTokens = formattedTokens + `${formattedToken}`
    }
  }

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
      "Potential Fix: We use Etherscan to get deployer addresses. Sometimes this gets rate limited, " + 
      "try again in a minute. If that does not work check Etherscan is live for all required networks. " +
      "Please use the appropriate token adder as specified in the base README."
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

// TODO verify off chain data

main()
  .then(() => {
    console.log("\nToken list validated!\n");
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
