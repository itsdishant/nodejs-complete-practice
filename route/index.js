const http = require("http");

const server = http.createServer((req, res) => {
  console.log(req.url, req.method, req.headers);

  let title = "Home";
  let content = "<h1>Welcome to the Homepage of Myntra</h1>";

  switch (req.url) {
    case "/":
      title = "Home";
      content = "<h1>Welcome to the Homepage of Myntra</h1>";
      break;
    case "/men":
      title = "Men";
      content = "<h1>Welcome to the Mens page of Myntra</h1>";
      break;
    case "/women":
      title = "Women";
      content = "<h1>Welcome to the Womens page of Myntra</h1>";
      break;
    case "/kids":
      title = "Kids";
      content = "<h1>Welcome to the Kids page of Myntra</h1>";
      break;
    case "/cart":
      title = "Cart";
      content = "<h1>Welcome to the Cart page of Myntra</h1>";
      break;
    default:
      res.statusCode = 404;
      title = "404 - Not Found";
      content = "<h1>404 - Page Not Found</h1>";
      break;
  }

  res.setHeader("Content-Type", "text/html");
  res.write("<!DOCTYPE html>");
  res.write("<html>");
  res.write(`<head><title>${title}</title></head>`);
  res.write("<body>");
  res.write("<nav>");
  res.write('<a href="/">Home</a> | ');
  res.write('<a href="/men">Men</a> | ');
  res.write('<a href="/women">Women</a> | ');
  res.write('<a href="/kids">Kids</a> | ');
  res.write('<a href="/cart">Cart</a>');
  res.write("</nav>");
  res.write(content);
  res.write("</body>");
  res.write("</html>");
  return res.end();
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on address http://localhost:${PORT}`);
});
