import bcrypt from "bcrypt";

const hashPassword = (password) => {
  return bcrypt.hash(password, 10);
};

export default hashPassword;
