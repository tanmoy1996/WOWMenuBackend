import { BlackListedTokens } from "../models";

export default (token) => {
  return BlackListedTokens.exists({ token });
};
