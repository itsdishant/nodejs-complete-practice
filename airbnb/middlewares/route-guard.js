const routeGuard = (role) => (req, res, next) => {
  if (!req.session?.isLoggedIn || !req.session?.userDetails?.id) {
    return res.redirect("/login");
  }
  if (role && req.session.userDetails.role !== role) {
    return res.redirect("/");
  }
  next();
};

module.exports = routeGuard;
module.exports.routeGuard = routeGuard;
