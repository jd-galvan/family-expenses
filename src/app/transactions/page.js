"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./transactions.module.css";
import { useCurrency } from "@/lib/useCurrency";

const COLORS = [
  "#667eea", "#764ba2", "#f093fb", "#f5576c",
  "#4facfe", "#43e97b", "#fa8231", "#a29bfe",
];

export default function TransactionsPage() {
  const router = useRouter();
  const { fmt, currency } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("expense");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const currentMonth = today.slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [form, setForm] = useState({
    amount: "",
    categoryId: "",
    description: "",
    date: today,
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetchTransactions(selectedMonth),
    ]).then(([cats]) => {
      setCategories(cats);
      setLoading(false);
    });
  }, []);

  async function fetchTransactions(month) {
    const res = await fetch(`/api/transactions?month=${month}`);
    const data = await res.json();
    setTransactions(data);
  }

  async function handleMonthChange(month) {
    setSelectedMonth(month);
    setLoading(true);
    await fetchTransactions(month);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.amount || !form.categoryId || !form.description.trim()) return;
    setSubmitting(true);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: activeTab,
        amount: parseFloat(form.amount),
        categoryId: Number(form.categoryId),
        description: form.description,
        date: form.date,
      }),
    });

    if (res.ok) {
      setForm({ amount: "", categoryId: "", description: "", date: today });
      const txMonth = form.date.slice(0, 7);
      if (txMonth === selectedMonth) await fetchTransactions(selectedMonth);
    }
    setSubmitting(false);
  }

  async function handleDelete(id) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }

  const filteredCategories = categories.filter((c) => c.type === activeTab);
  const filteredTransactions = transactions.filter((t) => t.type === activeTab);

  const total = filteredTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Genera los últimos 12 meses para el selector
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const value = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    return { value, label: label.charAt(0).toUpperCase() + label.slice(1) };
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push("/dashboard")} className={styles.backButton}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Dashboard
        </button>
        <h1 className={styles.title}>Transacciones</h1>
        <select
          value={selectedMonth}
          onChange={(e) => handleMonthChange(e.target.value)}
          className={styles.monthSelector}
        >
          {monthOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </header>

      <main className={styles.main}>
        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "expense" ? styles.activeExpense : ""}`}
            onClick={() => setActiveTab("expense")}
          >
            Egresos
          </button>
          <button
            className={`${styles.tab} ${activeTab === "income" ? styles.activeIncome : ""}`}
            onClick={() => setActiveTab("income")}
          >
            Ingresos
          </button>
        </div>

        <div className={styles.layout}>
          {/* Formulario */}
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>
              Nuevo {activeTab === "expense" ? "egreso" : "ingreso"}
            </h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Monto</label>
                <div className={styles.amountWrapper}>
                  <span className={styles.currencySymbol}>{currency.symbol}</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className={styles.amountInput}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Categoría</label>
                {filteredCategories.length === 0 ? (
                  <p className={styles.noCategories}>
                    No hay categorías.{" "}
                    <button type="button" className={styles.linkButton} onClick={() => router.push("/categories")}>
                      Agregar categorías
                    </button>
                  </p>
                ) : (
                  <div className={styles.categoryPills}>
                    {filteredCategories.map((cat, i) => (
                      <button
                        key={cat.id}
                        type="button"
                        className={`${styles.pill} ${form.categoryId === String(cat.id) ? styles.pillActive : ""}`}
                        style={form.categoryId === String(cat.id) ? { background: COLORS[i % COLORS.length], borderColor: COLORS[i % COLORS.length] } : {}}
                        onClick={() => setForm({ ...form, categoryId: String(cat.id) })}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.label}>Fecha</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Descripción</label>
                  <input
                    type="text"
                    placeholder={activeTab === "expense" ? "Ej: Supermercado" : "Ej: Salario"}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className={styles.input}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`${styles.submitButton} ${activeTab === "income" ? styles.submitIncome : ""}`}
                disabled={submitting || !form.amount || !form.categoryId || !form.description.trim()}
              >
                {submitting ? "Guardando..." : `Registrar ${activeTab === "expense" ? "egreso" : "ingreso"}`}
              </button>
            </form>
          </div>

          {/* Lista */}
          <div className={styles.listCard}>
            <div className={styles.listHeader}>
              <h2 className={styles.formTitle}>
                {activeTab === "expense" ? "Egresos" : "Ingresos"} del mes
              </h2>
              <span className={`${styles.total} ${activeTab === "income" ? styles.totalIncome : styles.totalExpense}`}>
                {fmt(total)}
              </span>
            </div>

            {loading ? (
              <p className={styles.empty}>Cargando...</p>
            ) : filteredTransactions.length === 0 ? (
              <p className={styles.empty}>Sin registros este mes.</p>
            ) : (
              <ul className={styles.list}>
                {filteredTransactions.map((t) => (
                  <li key={t.id} className={styles.item}>
                    <div className={styles.itemLeft}>
                      <span className={styles.itemCategory}>{t.categoryName}</span>
                      {t.description && <span className={styles.itemDesc}>{t.description}</span>}
                      <span className={styles.itemDate}>
                        {new Date(t.date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <div className={styles.itemRight}>
                      <span className={`${styles.itemAmount} ${activeTab === "income" ? styles.amountIncome : styles.amountExpense}`}>
                        {fmt(parseFloat(t.amount))}
                      </span>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className={styles.deleteButton}
                        aria-label="Eliminar"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                          <path d="M10 11v6M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
