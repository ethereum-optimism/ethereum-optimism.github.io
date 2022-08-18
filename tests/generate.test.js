const { generate } = require("../src/generate");
const path = require("path");

test("'generate' script parse data dir and compile correct token list", async () => {
  jest
    .spyOn(path, "resolve")
    .mockReturnValueOnce(path.resolve(__dirname, "data"));

  const mockDate = new Date(1660755600000);
  jest.spyOn(global, "Date").mockImplementation(() => mockDate);

  const tokenList = await generate();
  expect(tokenList).toMatchSnapshot({
    timestamp: mockDate.toISOString(),
  });
});
