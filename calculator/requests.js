const additionHandler = require("./addition");

const requestsHandler = (req, res) => {
  const url = new URL(req.url, "http://localhost");
  let title = "Home";
  let content = "<h1>Welcome to the Homepage of Calculator</h1>";

  switch (url.pathname) {
    case "/":
      title = "Home";
      content =
        "<h1>Welcome to the Homepage of Calculator</h1>\n<a href='/calculator'>Go to Calculator</a>";
      break;
    case "/calculator":
      title = "Calculator";
      content =
        "<h1>Welcome to the Calculator page of Calculator</h1>\n<form action='/calculate-result' method='POST'><input type='number' name='num1' placeholder='Enter first number'><input type='number' name='num2' placeholder='Enter second number'><button type='submit'>Calculate</button></form>";
      break;
    case "/calculate-result":
      additionHandler(req, res);
      return;
    default:
      res.statusCode = 404;
      title = "404 - Not Found";
      content = "<h1>404 - Page Not Found</h1>";
      break;
  }

  res.write("<!DOCTYPE html>");
  res.write("<html>");
  res.write(`<head><title>${title}</title></head>`);
  res.write("<body>");
  res.write(content);
  res.write("</body>");
  res.write("</html>");
  return res.end();
};

module.exports = requestsHandler;
