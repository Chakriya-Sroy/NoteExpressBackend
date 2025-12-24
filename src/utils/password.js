import bcrypt from "bcrypt";

export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

export const hashPassword = async (plainPassword) => {
  return await bcrypt.hash(plainPassword, 10);
};
