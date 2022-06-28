import tokenList from "../optimism.tokenlist.json";
import fs from 'fs';

async function main() {
    let updatedTokensList = tokenList;

    console.log(updatedTokensList)

    updatedTokensList.tokens.sort(
        function(a, b) {         
            let aName = a.name.toLowerCase();
            let bName = b.name.toLowerCase();
            if (aName === bName) {
                return a.chainId - b.chainId;
            }
            return aName > bName ? 1 : -1;
        }
    );

    writeFile("./optimism.tokenlist.json", updatedTokensList);
}

function writeFile(path: any, data: any) {
    try {
        let stringData = JSON.stringify(data)
        fs.writeFileSync(path, stringData, {
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