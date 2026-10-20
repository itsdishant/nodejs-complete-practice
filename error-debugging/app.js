const http = require("http");
const calculateArea = require("./program");

const server = http.createServer((req, res) => {
  calculateArea(20, 35);
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
