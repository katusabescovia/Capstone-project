const RATE_PER_KG = {
  PET: 200,
  HDPE: 250,
  LDPE: 180,
  PP: 220,
  NYLON: 150,
};

// Convert quantity to kg based on unit
const toKg = (quantity, unit) => {
  const q = Number(quantity);
  if (Number.isNaN(q)) return 0;

  if (unit === "kg") return q;
  if (unit === "g") return q / 1000;
  if (unit === "ton") return q * 1000;

  return q; // default
};

exports.calculatePrice = ({ category, quantity, measurementUnit = "kg" }) => {
  const key = String(category || "").toUpperCase().trim();
  const rate = RATE_PER_KG[key];

  if (!rate) {
    return {
      ok: false,
      message: `No pricing rate set for category: ${category}`,
    };
  }

  const qtyKg = toKg(quantity, measurementUnit);
  const price = Math.round(qtyKg * rate);

  return { ok: true, price, ratePerKg: rate, quantityKg: qtyKg };
};