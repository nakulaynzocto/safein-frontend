import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET;

if (!SECRET_KEY) {
  throw new Error("NEXT_PUBLIC_CRYPTO_SECRET is not defined");
}

export const encryptData = <T>(data: T): string => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    SECRET_KEY
  ).toString();
};
