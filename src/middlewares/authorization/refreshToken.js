import { Users } from "../../models";
import { REFRESH_TOKEN_SECRET_KEY } from "../../../config";
import isTokenBlackListedUtil from "../../utils/isTokenBlackListedUtil";
import jwt from "jsonwebtoken";
import * as Sentry from "@sentry/node";

export const authRefreshToken = async function (req, res, next) {
  if (req.cookies.refreshToken) {
    const refreshToken = req.cookies.refreshToken.split(" ")[1];
    if (await isTokenBlackListedUtil(refreshToken)) {
      Sentry.captureMessage("Expired/invalid token passed", "warning");
      res.status(401).json({ message: "Expired/invalid token passed" });
    } else {
      await jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET_KEY,
        async (err, userDetails) => {
          try {
            if (err) res.status(401).json("Invalid token");
            const { payload } = userDetails;
            const user = await Users.findById(payload.id).populate(
              "restaurant",
            );

            if (!user) {
              Sentry.captureMessage("Invalid user details", "warning");
              res.status(400).json("Invalid user details");
            }

            user.refreshToken = refreshToken;
            req.user = user;
            next();
          } catch (e) {
            Sentry.captureException(e);
            res.status(400).json("Try after sometime");
          }
        },
      );
    }
  } else {
    res
      .status(401)
      .json({ message: "Connection timed out. Please login again." });
  }
};
