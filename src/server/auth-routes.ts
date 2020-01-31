import express from 'express';
import passport from 'passport';

const authRoutes = express.Router();

authRoutes.get("/login", passport.authenticate("auth0", {
  scope: "openid email profile"
}), (_req, res) => res.redirect("/"));

authRoutes.get("/callback", (req, res, next) => {
  passport.authenticate("auth0",  (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect("/login");
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect("/account");
    });
  })(req, res, next);
});

authRoutes.get("/logout", (req, res) => {
  req.logout();

  const {AUTH0_DOMAIN, AUTH0_CLIENT_ID, BASE_URL} = process.env;
  res.redirect(`https://${AUTH0_DOMAIN}/logout?client_id=${AUTH0_CLIENT_ID}&returnTo=${BASE_URL}`);
});

export default authRoutes