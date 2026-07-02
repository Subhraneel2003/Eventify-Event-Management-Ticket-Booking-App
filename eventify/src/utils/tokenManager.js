import jwtEncode from "jwt-encode";
import { jwtDecode } from "jwt-decode";

export const generateToken = (id) => {
  const secret = process.env.EXPO_PUBLIC_JWT_SECRET;

  const payload = {
    id,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
  };

  const token = jwtEncode(payload, secret);

  return token;
};

export const verifyToken = (token) => {
  try {
    const decodedToken = jwtDecode(token);

    if (decodedToken.exp && decodedToken.exp * 1000 < Date.now()) {
      return null;
    }

    return decodedToken;
  } catch (err) {
    return null;
  }
};
