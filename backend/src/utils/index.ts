import { decodeAddress } from "@polkadot/util-crypto";

export const addressValidator = (value: string, helpers: any) => {
  try {
    // throws if invalid
    decodeAddress(value);
    return value;
  } catch {
    return helpers.error('any.invalid');
  }
};
