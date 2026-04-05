"use client";

import { useState, useEffect, useCallback } from "react";

export const CURRENCIES = [
  { code: "EUR", symbol: "€", locale: "es-ES", label: "Euro" },
  { code: "USD", symbol: "$", locale: "en-US", label: "Dólar" },
  { code: "PEN", symbol: "S/", locale: "es-PE", label: "Sol peruano" },
  { code: "CLP", symbol: "$", locale: "es-CL", label: "Peso chileno" },
];

const DEFAULT = "EUR";
const KEY = "currency";

export function useCurrency() {
  const [code, setCode] = useState(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored && CURRENCIES.find((c) => c.code === stored)) {
      setCode(stored);
    }
  }, []);

  const setCurrency = useCallback((newCode) => {
    localStorage.setItem(KEY, newCode);
    setCode(newCode);
  }, []);

  const currency = CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];

  const fmt = useCallback(
    (amount) =>
      Number(amount).toLocaleString(currency.locale, {
        style: "currency",
        currency: currency.code,
        minimumFractionDigits: currency.code === "CLP" ? 0 : 2,
        maximumFractionDigits: currency.code === "CLP" ? 0 : 2,
      }),
    [currency]
  );

  return { currency, code, setCurrency, fmt };
}
