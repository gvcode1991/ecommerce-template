import { availableSizes } from "../config/storeConfig";

export function normalizeStock(stock) {
  if (Array.isArray(stock)) {
    return stock
      .map((item) => ({ size: String(item?.size || "").trim(), quantity: Number(item?.quantity || 0) }))
      .filter((item) => item.size);
  }

  const quantity = Number(stock || 0);
  return quantity > 0 ? [{ size: "Unico", quantity }] : [];
}

export function stockToText(stock) {
  return normalizeStock(stock).map((item) => `${item.size}: ${item.quantity}`).join("\n");
}

export function stockTotal(stock) {
  return normalizeStock(stock).reduce((sum, item) => sum + item.quantity, 0);
}

export function parseStockText(stockText) {
  return String(stockText || "")
    .split(/[\n,]+/)
    .map((line) => {
      const [size, quantity] = line.split(/[:=]/).map((part) => part.trim());
      return { size, quantity: Number(quantity || 0) };
    })
    .filter((item) => item.size);
}

export function parseListText(value) {
  return String(value || "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getProductSizes(product) {
  const stock = normalizeStock(product?.stock);
  return stock.length ? stock.filter((item) => item.quantity > 0).map((item) => item.size) : availableSizes;
}
