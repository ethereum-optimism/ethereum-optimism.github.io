import tokenList from "../optimism.tokenlist.json";
import { promises as fsPromises } from 'fs';

async function main() {
    let tokens = tokenList.tokens;

    tokens.sort(
        function(a, b) {         
            let aName = a.name.toLowerCase();
            let bName = b.name.toLowerCase();
            if (aName === bName) {
                return a.chainId - b.chainId;
            }
            return aName > bName ? 1 : -1;
        }
    );

    await asyncWriteFile(tokens);
}

async function asyncWriteFile( data: any) {
    try {
        let stringData = JSON.stringify(data)
      await fsPromises.writeFile("./scripts/orderedList.json", stringData, {
        flag: 'w',
      });
    } catch (err) {
      console.log(err);
      return 'Something went wrong';
    }
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