import dotenv from "dotenv";
import { providers, Contract } from "ethers";
import tokenList from "../optimism.tokenlist.json";
import tokenInterface from "./tokenInterface.json";
import { getContractInterface } from "@eth-optimism/contracts";

dotenv.config();
const l1BridgeAbi = getContractInterface("L1StandardBridge");
const l2BridgeAbi = getContractInterface("L2StandardBridge");

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
      // Skip validation for the DF and MKR tokens which use bytes32 properties for symbol and name
      if (
        tokenData.address === '0x79E40d67DA6eAE5eB4A93Fc6a56A7961625E15F3' ||
        tokenData.address === '0x431ad2ff6a9C365805eBaD47Ee021148d6f7DBe0' ||
        tokenData.address === '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2')
      {
        continue;
      }

      const contract = new Contract(
        tokenData.address,
        tokenInterface,
        currentChainProvider
      );

      const symbol = await contract.symbol();
      const decimals = await contract.decimals();

      if (symbol !== tokenData.symbol) {
        // Add an exception for
        // DCN token as the symbol on chain and in the token list intentionally differ, i.e. ٨ vs DCN
        if (tokenData.symbol !== "DCN" && tokenData.symbol !== "THALES") {
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

      if (tokenData.extensions?.bridgeInfo) {
        await validateBridgeAddress(tokenData);
      }

      console.log(
        `${symbol} validated on ${networkMap[chainId]} - Address: ${tokenData.address}`
      );
    }
  }
}

const validateBridgeAddress = async currentChainTokenData => {
  const optimismChainId = oppositeChainIdMap[currentChainTokenData.chainId];
  const optimismNetwork = networkURLMap[optimismChainId];

  // Check `bridgeInfo` has an entry for the Optimism chain id
  if (!currentChainTokenData.extensions.bridgeInfo[optimismChainId]) {
    throw Error(
      `Bridge information mising for Optimism chain ${currentChainTokenData.symbol}`
    );
  }

  const layer = chainIdLayerMap[optimismChainId];
  const optimismChainProvider = new providers.JsonRpcProvider(optimismNetwork);
  const bridgeAbi = layer === 1 ? l1BridgeAbi : l2BridgeAbi;
  const optimismBridge = new Contract(
    currentChainTokenData.extensions.bridgeInfo[optimismChainId].destBridgeAddress,
    bridgeAbi,
    optimismChainProvider
  );

  let isValid = false;
  // Exclude tokens with custom bridges from validation of the bridge setup
  if (
    currentChainTokenData.symbol === "SNX" ||
    currentChainTokenData.symbol === "DAI" ||
    currentChainTokenData.symbol === "USX"
  ) {
    isValid = true;
  } else {
    try {
      const l1BridgeAddress = await optimismBridge["l1TokenBridge"]();
      const originBridgeAddress = currentChainTokenData.extensions.bridgeInfo[optimismChainId].originBridgeAddress;
      if (originBridgeAddress === l1BridgeAddress) {
        isValid = true;
      } else {
        throw Error(
          `Bridge address invalid for ${currentChainTokenData.symbol}: ${originBridgeAddress}`
        );
      }
    } catch {
      throw Error(
        `Bridge validation error for ${currentChainTokenData.symbol}`
      );
    }
  }

  return isValid;
};

main()
  .then(() => {
    console.log("\nToken list validated!\n");
    process.exit(0);
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });