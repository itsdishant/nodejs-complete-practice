const hostController = require("../controllers/appController").hostController;

module.exports = function renderAddHomeError(res, formValues, formError, req) {
  return hostController(
    res.status(400),
    "add-home",
    "Airbnb | List your home",
    req?.path || "/host/add-home",
    {
      formValues,
      formError,
    },
  );
};
