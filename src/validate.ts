import dotenv from "dotenv";
import * as core from "@actions/core";
import { providers, Contract } from "ethers";
import tokenList from "../optimism.tokenlist.json";
import tokenInterface from "./tokenInterface.json";
import { getContractInterface } from "@eth-optimism/contracts";

dotenv.config();
const l1BridgeAbi = getContractInterface("OVM_L1StandardBridge");
const l2BridgeAbi = getContractInterface("OVM_L2StandardBridge");

export const chainIds = {
  MAINNET_L1: 1,
  MAINNET_L2: 10,
  KOVAN_L1: 42,
  KOVAN_L2: 69
};

export const oppositeChainIdMap = {
  [chainIds.MAINNET_L1]: chainIds.MAINNET_L2,
  [chainIds.KOVAN_L1]: chainIds.KOVAN_L2,
  [chainIds.MAINNET_L2]: chainIds.MAINNET_L1,
  [chainIds.KOVAN_L2]: chainIds.KOVAN_L1
};

export const chainIdLayerMap = {
  [chainIds.MAINNET_L1]: 1,
  [chainIds.KOVAN_L1]: 1,
  [chainIds.MAINNET_L2]: 2,
  [chainIds.KOVAN_L2]: 2
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

async function main() {
  const tokenListsByChainId = Object.keys(networkURLMap).map(chainId =>
    tokenList.tokens.filter(tokenData => tokenData.chainId === Number(chainId))
  );

  for (const tokenList of tokenListsByChainId) {
    const chainId = tokenList[0]?.chainId;
    const currentNetwork = networkURLMap[chainId];
    const currentChainProvider = new providers.JsonRpcProvider(currentNetwork);

    for (const tokenData of tokenList) {
      const contract = new Contract(
        tokenData.address,
        tokenInterface,
        currentChainProvider
      );

      const symbol = await contract.symbol();
      const decimals = await contract.decimals();

      if (symbol !== tokenData.symbol) {
        // Add an exception for
        // DF token as it uses bytes32 properties for symbol and name
        // DCN token as the symbol on chain and in the token list intentionally differ, i.e. ٨ vs DCN
        if (tokenData.symbol !== "DF" && tokenData.symbol !== "DCN") {
          throw Error(
            `Contract symbol mismatch. ${symbol} !== ${tokenData.symbol} \nAddress: ${tokenData.address}`
          );
        }
      }
      if (decimals !== tokenData.decimals) {
        throw Error(
          `Contract decimals mismatch. ${decimals} !== ${tokenData.decimals} \nAddress: ${tokenData.address}`
        );
      }

      if (tokenData.extensions?.optimismBridgeAddress) {
        try {
          await validateBridgeAddress(tokenData);
        } catch (err) {
          console.error(err.message);
          process.exit();
        }
      }

      console.log(
        `${symbol} validated on ${networkMap[chainId]} - Address: ${tokenData.address}`
      );
    }
  }
}

const validateBridgeAddress = async currentChainTokenData => {
  const oppositeChainId = oppositeChainIdMap[currentChainTokenData.chainId];
  const oppositeNetwork = networkURLMap[oppositeChainId];
  const oppositeChainTokenData = tokenList.tokens.find(
    data =>
      data.chainId === oppositeChainId &&
      data.symbol === currentChainTokenData.symbol &&
      data.name === currentChainTokenData.name
  );

  if (!oppositeChainTokenData) {
    console.warn(`No match found for ${currentChainTokenData.symbol}`);
    return;
  }

  const layer = chainIdLayerMap[oppositeChainId];
  const oppositeChainProvider = new providers.JsonRpcProvider(oppositeNetwork);
  const bridgeAbi = layer === 1 ? l1BridgeAbi : l2BridgeAbi;
  const oppositeChainBridge = new Contract(
    oppositeChainTokenData.extensions.optimismBridgeAddress,
    bridgeAbi,
    oppositeChainProvider
  );

  let isValid = false;
  // Exclude tokens with custom bridges from validation of the bridge setup
  if (
    currentChainTokenData.symbol === "SNX" ||
    currentChainTokenData.symbol === "DAI"
  ) {
    isValid = true;
  } else {
    const funcName = layer === 1 ? "l2TokenBridge" : "l1TokenBridge";

    try {
      const oppositeBridgeAddress = await oppositeChainBridge[funcName]();
      if (
        currentChainTokenData.extensions.optimismBridgeAddress !==
        oppositeBridgeAddress
      ) {
        throw Error();
      } else {
        isValid = true;
      }
    } catch (err) {
      throw Error(
        `Bridge address invalid for ${currentChainTokenData.symbol}: ${currentChainTokenData.extensions.optimismBridgeAddress}`
      );
    }
  }

  return isValid;
};

main()
  .then(() => {
    console.log("\nToken list validated!\n");
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
