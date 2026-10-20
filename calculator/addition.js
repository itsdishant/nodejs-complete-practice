const additionHandler = (req, res) => {
  if (req.url === "/calculate-result" && req.method === "POST") {
    const body = [];
    let result = 0;

    req.on("data", (chunk) => {
      body.push(chunk);
    });

    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();
      const urlSearchParams = new URLSearchParams(parsedBody);
      const bodyObject = Object.fromEntries(urlSearchParams.entries());
      const num1 = parseFloat(bodyObject.num1);
      const num2 = parseFloat(bodyObject.num2);
      result = num1 + num2;
      res.end(`<h1>Result: ${result}</h1>`);
    });
  }
};

module.exports = additionHandler;
