const http = require("http");
const requestsHandler = require("./requests");

const server = http.createServer((req, res) => {
  requestsHandler(req, res);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
