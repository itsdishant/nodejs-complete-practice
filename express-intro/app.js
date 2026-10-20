const express = require("express");
const bodyParser = require("body-parser");
const contactRouter = require("./routes/contactRoutes");
const path = require("path");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(contactRouter);

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "views/404.html"));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
