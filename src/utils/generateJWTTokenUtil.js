import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
} from "../../config";

const tokenProperties = {
  access: {
    options: {
      expiresIn: "1 hour",
    },
    secretKey: ACCESS_TOKEN_SECRET_KEY,
  },
  refresh: {
    options: {
      expiresIn: "1 day",
    },
    secretKey: REFRESH_TOKEN_SECRET_KEY,
  },
};

export default function generateJWTToken(payload, tokenType) {
  const { options, secretKey } = tokenProperties[tokenType];
  return jwt.sign({ payload }, secretKey, options);
}
