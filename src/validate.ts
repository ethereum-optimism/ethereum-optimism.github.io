import dotenv from "dotenv";
import { providers, Contract } from "ethers";
import tokenList from "../optimism.tokenlist.json";
import validationInterface from "./validationInterface.json";

dotenv.config();

const chainIdMap = {
  1: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
  10: `https://mainnet.optimism.io`,
  42: `https://kovan.infura.io/v3/${process.env.INFURA_KEY}`,
  69: `https://kovan.optimism.io`
};

const networkMap = {
  1: "Mainnet",
  10: "Optimistic Ethereum",
  42: "Kovan",
  69: "Optimistic Kovan"
};

async function main() {
  const tokenListsByChainId = Object.keys(chainIdMap).map(chainId =>
    tokenList.tokens.filter(tokenData => tokenData.chainId === Number(chainId))
  );

  for (const tokenList of tokenListsByChainId) {
    const chainId = tokenList[0]?.chainId;
    const networkURL = chainIdMap[chainId];
    const provider = new providers.JsonRpcProvider(networkURL);

    for (const token of tokenList) {
      const contract = new Contract(
        token.address,
        JSON.stringify(validationInterface),
        provider
      );

      const symbol = await contract.symbol();
      const decimals = await contract.decimals();

      if (symbol !== token.symbol) {
        throw Error(
          `Contract symbol mismatch. ${symbol} !== ${token.symbol} \nAddress: ${token.address}`
        );
      }
      if (decimals !== token.decimals) {
        throw Error(
          `Contract decimals mismatch. ${decimals} !== ${token.decimals} \nAddress: ${token.address}`
        );
      }
      console.log(
        `${symbol} validated on ${networkMap[chainId]} - Address: ${token.address}`
      );
    }
  }
}

main()
  .then(() => {
    console.log("\nToken list validated!\n");
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
