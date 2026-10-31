import { commerce } from "./brand";

const names: Record<string, string> = {
  NL: "Netherlands", BE: "Belgium", DE: "Germany", FR: "France", LU: "Luxembourg", AT: "Austria", IE: "Ireland",
  ES: "Spain", IT: "Italy", DK: "Denmark", SE: "Sweden", FI: "Finland", PT: "Portugal", GB: "United Kingdom",
};

export const shippingCountries = commerce.shippingCountries.map((code) => ({ code, name: names[code] ?? code }));
