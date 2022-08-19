const { generate } = require("../src/generate");

const main = async () => {
  await generate(
    process.argv.slice(2)
      .filter((file) => {
        return file.startsWith('data')
      })
      .map((file) => {
        return file.split('/')[1]
      })
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  })
