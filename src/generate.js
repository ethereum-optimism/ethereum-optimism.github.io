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
const errors = require("./errors");

const abi = require("./abi/token.json");

/**
 * Base URL where static assets are hosted.
 */
const BASE_URL = "https://ethereum-optimism.github.io";

/**
 * Generates and validates the token list JSON object from the data folder.
 *
 * @param tokens List of tokens to run validation on.
 * @returns Generated and validated token list JSON object.
 */
const generate = async (tokens) => {
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
    console.log(`validating ${folder}`);

    const datafile = path.join(datadir, folder, "data.json");
    assert(fs.existsSync(datafile), `${datafile} does not exist (${folder})`);

    const data = require(datafile);
    const v = new Validator();
    const result = v.validate(data, TOKEN_DATA_SCHEMA);
    if (!result.valid) {
      throw new errors.ErrInvalidDataJson(
        `${folder}: data.json is not valid:\n${result.errors
        .map((err) => {
          return ` - ${err.property}: ${err.message}`;
        })
        .join("\n")}\n`
      );
    }

    const logofiles = glob.sync(`${path.join(datadir, folder)}/logo.{png,svg}`);
    if (logofiles.length !== 1) {
      throw new errors.ErrInvalidLogoFile(
        `${folder}: exactly one logo file must be present, make sure your logo file is named either "logo.png" or "logo.svg"`
      );
    }

    for (const [chain, token] of Object.entries(data.tokens)) {
      if (tokens && tokens.includes(folder)) {
        console.log(`validating ${folder} on chain ${chain}`);

        if (folder !== "ETH" && data.nonstandard !== true) {
          const contract = new ethers.Contract(
            token.address,
            abi,
            NETWORK_DATA[chain].provider
          );

          if (
            token.overrides?.decimals === undefined
            && data.decimals !== (await contract.decimals())
          ) {
            throw new errors.ErrInvalidTokenDecimals(
              `${chain} ${folder} decimals does not match data.json decimals`
            );
          }

          if (
            token.overrides?.symbol === undefined
            && data.symbol !== (await contract.symbol())
          ) {
            throw new errors.ErrInvalidTokenSymbol(
              `${chain} ${folder} symbol does not match data.json symbol`
            );
          }

          // Names get changed enough that we'll just check that the function exists.
          try {
            await contract.name();
          } catch (err) {
            throw new errors.ErrInvalidTokenName(
              `${chain} ${folder} could not get token name`
            );
          }
        }
      }

      list.tokens.push({
        chainId: NETWORK_DATA[chain].id,
        address: token.address,
        name: token.overrides?.name ?? data.name,
        symbol: token.overrides?.symbol ?? data.symbol,
        decimals: token.overrides?.decimals ?? data.decimals,
        logoURI: `${BASE_URL}/data/${folder}/logo.${
          logofiles[0].endsWith("png") ? "png" : "svg"
        }`,
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
    throw new errors.ErrInvalidTokenList(
      `final token list is not valid:\n ${validator.errors}`
    );
  }

  return list;
};

module.exports = {
  generate,
};
