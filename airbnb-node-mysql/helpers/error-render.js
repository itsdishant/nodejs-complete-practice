const hostController = require("../controllers/appController").hostController;
const { error } = require("../utils/notification");

module.exports = function renderAddHomeError(res, formValues, formError, req) {
  return hostController(
    res.status(400),
    "add-home",
    "Airbnb | List your home",
    // ponytail: callers don't pass req; this path only drives nav highlighting.
    req?.path || "/host/add-home",
    {
      formValues,
      formError,
      notice: error(formError),
    },
  );
};
