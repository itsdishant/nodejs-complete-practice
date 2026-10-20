const http = require("http");
const userServerHandler = require("./user");

const server = http.createServer(userServerHandler);

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
