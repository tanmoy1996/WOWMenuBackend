import passport from "passport";
import LocalStrategy from "passport-local";
import { Users } from "../../src/models";
import bcrypt from "bcrypt";
import generateJWTToken from "../../src/utils/generateJWTTokenUtil";
import * as Sentry from "@sentry/node";

const localStrategy = new LocalStrategy(
  {},
  async (username, password, done) => {
    try {
      let user;
      if (validateEmail(username)) {
        user = await Users.find({ emailId: username }).populate("restaurant");
      } else {
        user = await Users.find({ username }).populate("restaurant");
      }

      if (user.length === 0) {
        Sentry.captureMessage("Username/Email is not registered", "warning");
        return done(null, false, "Username/Email is not registered");
      } else if (user[0].role === "owner" && !user[0].isVerified) {
        return done(null, false, "Please verify your account to login");
      } else {
        if (await bcrypt.compare(password, user[0].password)) {
          const payload = user[0];
          payload["password"] = undefined;
          const accessToken = generateJWTToken(payload, "access");
          const refreshToken = generateJWTToken(payload, "refresh");
          return done(null, {
            userDetails: payload,
            accessToken,
            refreshToken,
          });
        } else {
          return done(null, false, "Incorrect password");
        }
      }
    } catch (error) {
      Sentry.captureException(error);
      return done(error);
    }
  },
);

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, // eslint-disable-line
    );
};

passport.use(localStrategy);

export const authenticateUser = async function (req, res, next) {
  passport.authenticate(
    "local",
    {
      session: false,
    },
    function (err, user, info) {
      if (err) {
        Sentry.captureException(err);
        res.status(401).json({ message: err.message });
      } else if (info) {
        res.status(401).json({ message: info });
      } else {
        req.user = user;
        next();
      }
    },
  )(req, res, next);
};
