import jwt from "jsonwebtoken";

export const generateToken = (id) => {
  const secret = process.env.EXPO_PUBLIC_JWT_SECRET;

  const token = jwt.sign(
    {
      id,
    },
    secret,
    {
      expiresIn: "1h",
    },
  );

  return token;
};

export const verifyToken = (token) => {
  const secret = process.env.EXPO_PUBLIC_JWT_SECRET;

  try {
    const decodedToken = jwt.verify(token, secret);

    return decodedToken;
  } catch (err) {
    return null;
  }
};
