const fs = require("fs");
const path = require("path");
const glob = require("glob");
const assert = require("assert");
const Validator = require("jsonschema").Validator;
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { schema } = require("@uniswap/token-lists");
const { ethers } = require("ethers");

const { version } = require("../package.json");
const { TOKEN_DATA_SCHEMA } = require("./schemas");
const { NETWORK_DATA } = require("./chains");

const abi = require("./abi/token.json");

/**
 * Base URL where static assets are hosted.
 */
const BASE_URL = "https://ethereum-optimism.github.io";

/**
 * Generates and validates the token list JSON object from the data folder.
 *
 * @returns Generated and validated token list JSON object.
 */
const generate = async () => {
  const list = {
    name: "Optimism",
    logoURI: `${BASE_URL}/optimism.svg`,
    keywords: ["scaling", "layer2", "infrastructure"],
    timestamp: new Date().toISOString(),
    tokens: [],
    version: {
      major: parseInt(version.split(".")[0]),
      minor: parseInt(version.split(".")[1]),
      patch: parseInt(version.split(".")[2]),
    },
  };

  const datadir = path.resolve(__dirname, "../data/");
  const folders = fs.readdirSync(datadir).sort((a, b) => {
    return a.toLowerCase().localeCompare(b.toLowerCase());
  });

  for (const folder of folders) {
    const datafile = path.join(datadir, folder, "data.json");
    assert(fs.existsSync(datafile), `${datafile} does not exist (${folder})`);

    const data = require(datafile);
    const v = new Validator();
    const result = v.validate(data, TOKEN_DATA_SCHEMA);
    if (!result.valid) {
      throw new Error(
        `${folder}: data.json is not valid:\n ${result.errors
          .map((err) => {
            return `- ${err.property}: ${err.message}`;
          })
          .join("\n")}\n`
      );
    }

    const logofiles = glob.sync(`${path.join(datadir, folder)}/logo.{png,svg}`);
    assert(
      logofiles.length === 1,
      `must have exactly one logo file (${folder})`
    );
    const logoExtension = logofiles[0].endsWith("png") ? "png" : "svg";

    for (const [chain, token] of Object.entries(data.tokens)) {
      console.log(`validating ${folder} on chain ${chain}`);

      if (folder !== "ETH" && data.nonstandard !== true) {
        const contract = new ethers.Contract(
          token.address,
          abi,
          NETWORK_DATA[chain].provider
        );

        assert(
          token.overrides?.decimals !== undefined ||
            data.decimals == (await contract.decimals()),
          `${chain} ${folder} decimals mismatch`
        );

        assert(
          token.overrides?.symbol !== undefined ||
            data.symbol === (await contract.symbol()),
          `${chain} ${folder} symbol mismatch`
        );

        // Names get changed enough that we'll just check that the function exists.
        await contract.name();
      }

      list.tokens.push({
        chainId: NETWORK_DATA[chain].id,
        address: token.address,
        name: token.overrides?.name ?? data.name,
        symbol: token.overrides?.symbol ?? data.symbol,
        decimals: token.overrides?.decimals ?? data.decimals,
        logoURI: `${BASE_URL}/data/${folder}/logo.${logoExtension}`,
        extensions: {
          optimismBridgeAddress:
            token.overrides?.bridge ?? NETWORK_DATA[chain].bridge,
        },
      });
    }
  }

  // Verify that the final generated token list is valid
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  const validator = ajv.compile(schema);
  if (!validator(list)) {
    console.log(validator.errors);
    throw new Error("generated token list is not valid");
  }

  return list;
};

module.exports = {
  generate,
};
