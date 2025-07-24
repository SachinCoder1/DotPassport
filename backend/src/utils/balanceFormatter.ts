/**
 * Convert a base‑unit amount (e.g. Planck for DOT) into
 * a human‑readable decimal string.
 *
 * @param amountBase  Raw amount in base units, as a string
 * @param decimals    Number of decimal places (DOT = 10)
 * @returns           A string like "123.456"
 */
export function formatUnits(amountBase: string, decimals = 10): string {
  const bn   = BigInt(amountBase);
  const unit = BigInt(10) ** BigInt(decimals);

  const whole    = bn / unit;
  let   fraction = (bn % unit).toString().padStart(decimals, '0');

  // Trim trailing zeros from the fractional part:
  fraction = fraction.replace(/0+$/, '');

  return fraction
    ? `${whole.toString()}.${fraction}`
    : whole.toString();
}

/**
 * If you just need a JS number (good enough for scoring thresholds),
 * you can use this:
 */
export function parseUnits(amountBase: string, decimals = 10): number {
  const bn   = BigInt(amountBase);
  const unit = BigInt(10) ** BigInt(decimals);

  const whole    = bn / unit;
  const remainder= bn % unit;

  // JS numbers lose precision past ~1e15, but fine for most score calcs
  return Number(whole) + Number(remainder) / Number(unit);
}
