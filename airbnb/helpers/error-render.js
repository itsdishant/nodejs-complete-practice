const {
  homeController,
  hostController,
  userController,
  sharedController,
  reserveController,
} = require("../controllers/appController");

// Module name -> page renderer. Kept as data so adding a page module is a
// one-line change here instead of another branch in renderFormError.
const CONTROLLERS = {
  home: homeController,
  host: hostController,
  user: userController,
  shared: sharedController,
  reserve: reserveController,
};

function renderFormError(
  res,
  fileName,
  pageTitle,
  moduleName,
  formError,
  req,
  extraData = {},
) {
  const controller = CONTROLLERS[moduleName];

  if (!controller) {
    throw new Error(
      `renderFormError: unknown module "${moduleName}" (expected one of ${Object.keys(CONTROLLERS).join(", ")})`,
    );
  }

  return controller(
    res,
    fileName,
    pageTitle,
    (req?.baseUrl || "") + (req?.path || ""),
    {
      formValues: req?.body,
      formError,
      ...extraData,
    },
  );
}

module.exports = {
  renderFormError,
};
