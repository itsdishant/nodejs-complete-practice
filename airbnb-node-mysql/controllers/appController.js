const path = require("path");
const ejs = require("ejs");

const VIEWS = path.join(__dirname, "..", "views");

// ponytail: every view is just page content; the document shell lives in
// partials/content.ejs, so no page repeats the doctype/head/header/main boilerplate.
// res.locals.notice (set in app.js) rides along so any page can fire a toast.
async function renderPage(res, view, title, currentPath, data = {}) {
  const locals = { ...res.locals, title, currentPath, ...data };
  try {
    const body = await ejs.renderFile(path.join(VIEWS, view), locals);
    const html = await ejs.renderFile(
      path.join(VIEWS, "partials", "content.ejs"),
      { ...locals, body },
    );
    res.send(html);
  } catch (err) {
    // A broken template can't render a page, so surface the reason as text.
    res.status(500).send(`Something went wrong while rendering this page: ${err.message}`);
  }
}

const page = (dir) => (res, view, title, currentPath, data) =>
  renderPage(res, `${dir}${view}.ejs`, title, currentPath, data);

exports.homeController = page("");
exports.hostController = page("host/");
exports.reserveController = page("reserve/");
exports.sharedController = page("shared/");
