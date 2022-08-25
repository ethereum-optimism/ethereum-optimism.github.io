const fs = require("fs");
const path = require("path");
const glob = require("glob");
const assert = require("assert");
const { URLSearchParams } = require("url");

const fetch = require("node-fetch");
const Validator = require("jsonschema").Validator;
const Ajv = require("ajv");
const addFormats = require("ajv-formats");
const { schema } = require("@uniswap/token-lists");
const { ethers } = require("ethers");
const { sleep } = require("@eth-optimism/core-utils");

const { version } = require("../package.json");
const { TOKEN_DATA_SCHEMA } = require("./schemas");
const { NETWORK_DATA } = require("./chains");
const errors = require("./errors");

const tokenABI = require("./abi/token.json");
const factoryABI = require("./abi/factory.json");

/**
 * Base URL where static assets are hosted.
 */
const BASE_URL = "https://ethereum-optimism.github.io";

/**
 * Call this to make CI require manual review.
 *
 * @param message Helpful message to display to the user.
 */
const review = (token, chain, message) => {
  console.log(`requires manual review: (${token} on ${chain}) ${message}`)
}

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

  const cgret = await fetch("https://tokens.coingecko.com/uniswap/all.json");
  const cg = await cgret.json();

  for (const folder of folders) {
    const datafile = path.join(datadir, folder, "data.json");
    assert(fs.existsSync(datafile), `${datafile} does not exist (${folder})`);
    const data = require(datafile);

    const logofiles = glob.sync(`${path.join(datadir, folder)}/logo.{png,svg}`);
    if (logofiles.length !== 1) {
      throw new errors.ErrInvalidLogoFile(
        `${folder}: exactly one logo file must be present, make sure your logo file is named either "logo.png" or "logo.svg"`
      );
    }

    if (tokens && tokens.includes(folder)) {
      console.log(`validating ${folder}`);
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
    }

    for (const [chain, token] of Object.entries(data.tokens)) {
      if (tokens && tokens.includes(folder)) {
        console.log(`validating ${folder} on chain ${chain}`);

        // Check to make sure the website will load
        for (let i = 0; i < 5; i++) {
          try {
            await fetch(data.website);
            break;
          } catch (err) {
            if (i < 4) {
              console.log(`website did not load, trying again in 5s...`)
              await sleep(5000);
            } else {
              throw new errors.ErrWebsiteLoadFailed(
                `${folder}: website did not load: ${data.website}`
              );
            }
          }
        }

        if (folder !== "ETH" && data.nonstandard !== true) {
          const contract = new ethers.Contract(
            token.address,
            tokenABI,
            NETWORK_DATA[chain].provider
          );

          // Check that the token exists on this chain
          if (
            await contract.provider.getCode(token.address) === "0x"
          ) {
            throw new errors.ErrNoTokenCode(
              `${chain} ${folder} token has no code at address`
            );
          }

          // Check that the token has the correct decimals
          if (token.overrides?.decimals === undefined) {
            if (data.decimals !== (await contract.decimals())) {
              throw new errors.ErrInvalidTokenDecimals(
                `${chain} ${folder} decimals does not match data.json decimals`
              );
            }
          } else {
            review(folder, chain, "has decimal override");
          }

          // Check that the token has the correct symbol
          if (token.overrides?.symbol === undefined) {
            if (data.symbol !== (await contract.symbol())) {
              throw new errors.ErrInvalidTokenSymbol(
                `${chain} ${folder} symbol does not match data.json symbol`
              );
            }
          } else {
            review(folder, chain, "has symbol override");
          }

          // Check that the token has the correct name
          if (token.overrides?.name === undefined) {
            if (data.name !== (await contract.name())) {
              throw new errors.ErrInvalidTokenName(
                `${chain} ${folder} name does not match data.json name`
              );
            }
          } else {
            review(folder, chain, "has name override");
          }

          if (chain === "ethereum") {
            const found = cg.tokens.find((t) => {
              return t.address.toLowerCase() === token.address.toLowerCase();
            })

            // Trigger manual review if the Ethereum token is not in the CG token list
            if (!found) {
              review(folder, chain, "not found on CoinGecko token list");
            }
          }

          if (chain.startsWith('optimism')) {
            const factory = new ethers.Contract(
              '0x4200000000000000000000000000000000000012',
              factoryABI,
              NETWORK_DATA[chain].provider
            );

            const events = await factory.queryFilter(
              factory.filters.StandardL2TokenCreated(undefined, token.address)
            );

            // Trigger review if not created by standard token factory.
            if (events.length === 0) {
              review(folder, chain, "not created by standard token factory");
            }
          } else {
            // Make sure the token is verified on Etherscan.
            // Etherscan API is heavily rate limited, so sleep for 1s to avoid errors.
            await sleep(1000);
            const { result } = await (
              await fetch(`https://api${chain === 'ethereum' ? "" : `-${chain}`}.etherscan.io/api?` + new URLSearchParams({
                module: "contract",
                action: "getsourcecode",
                address: token.address,
                apikey: process.env.ETHERSCAN_API_KEY
              }))
            ).json()

            // Trigger review if code not verified on Etherscan
            if (result[0].ABI === "Contract source code not verified") {
              review(folder, chain, "code not verified on Etherscan");
            }
          }
        } else {
          review(folder, chain, "nonstandard token");
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
