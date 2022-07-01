import fs from "fs";

import dotenv from "dotenv";
dotenv.config();

export const infuraKey =
  process.env.INFURA_KEY || "84842078b09946638c03157f83405213";

export const factoryDeployer: string =
  "0x4200000000000000000000000000000000000012";

export const filePath = "./projects/standard-bridge/";

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

export enum validConfiguration {
  testing,
  fullSuite,
  unbridgeable
}

export const validConfigurations = {
  testing: [42, 69],
  fullSuite: [1, 10, 42, 69],
  unbridgeable: [10, 69]
};

export const standardBridgeAddress = {
  1: "0x99C9fc46f92E8a1c0deC1b1747d010903E884bE1",
  10: "0x4200000000000000000000000000000000000010",
  42: "0x22F24361D548e5FaAfb36d1437839f080363982B",
  69: "0x4200000000000000000000000000000000000010"
};

export const extensions = {
  1: `{"optimismBridgeAddress":"${standardBridgeAddress[1]}"}`,
  10: `{"optimismBridgeAddress":"${standardBridgeAddress[10]}"}`,
  42: `{"optimismBridgeAddress":"${standardBridgeAddress[42]}"}`,
  69: `{"optimismBridgeAddress":"${standardBridgeAddress[69]}"}`
};

export const networkURLMap = {
  1: `https://mainnet.infura.io/v3/${infuraKey}`,
  10: `https://mainnet.optimism.io`,
  42: `https://kovan.infura.io/v3/${infuraKey}`,
  69: `https://kovan.optimism.io`
};

export const networkMap = {
  1: "Mainnet",
  10: "Optimistic Ethereum",
  42: "Kovan",
  69: "Optimistic Kovan"
};

export type TokenListing = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  factoryDeployed: Boolean;
  extensions?: string;
};

export function readFile(path: any): any {
  try {
    const data = fs.readFileSync(path, { encoding: "utf8", flag: "r" });
    return data;
  } catch (err) {
    throw Error(
      "Unable to read file.\n" +
        "Potential Fix: Please ensure your file is named correctly and located in the correct folder."
    );
  }
}

export function writeFile(path: any, data: string) {
  try {
    fs.writeFileSync(path, data, {
      flag: "w"
    });
  } catch (err) {
    throw Error(
      "Unable to write to file.\n" +
        "Potential Fix: Please ensure your file is named correctly and located in the correct folder."
    );
  }
}
