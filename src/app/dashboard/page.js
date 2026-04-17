"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ResponsiveContainer, PieChart, Pie,
} from "recharts";
import styles from "./dashboard.module.css";
import { useCurrency } from "@/lib/useCurrency";

const COLORS = [
  "#667eea", "#764ba2", "#f093fb", "#f5576c",
  "#4facfe", "#43e97b", "#fa8231", "#a29bfe",
];

function buildMonthOptions() {
  const startDate = new Date(2026, 3, 1); // Abril 2026
  const options = [];
  const current = new Date();
  current.setDate(1);
  while (current >= startDate) {
    const value = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
    const label = current.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    options.push({ value, label: label.charAt(0).toUpperCase() + label.slice(1) });
    current.setMonth(current.getMonth() - 1);
  }
  return options;
}

const FIRST_MONTH = "2026-04"; // Mes en que se inicia el uso de la app

export default function DashboardPage() {
  const router = useRouter();
  const { fmt } = useCurrency();
  const monthOptions = buildMonthOptions();
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [transactions, setTransactions] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialBalance, setInitialBalance] = useState(null);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceInput, setBalanceInput] = useState("");
  const [savingBalance, setSavingBalance] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadAll(monthOptions[0].value);
  }, []);

  async function loadAll(month) {
    setLoading(true);
    const [txs] = await Promise.all([
      fetch(`/api/transactions?month=${month}`).then((r) => r.json()),
      loadOrCreateBalance(month),
    ]);
    setTransactions(txs);
    setMonthlyTotals([
      {
        name: "Ingresos",
        value: txs.filter((t) => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0),
      },
      {
        name: "Egresos",
        value: txs.filter((t) => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0),
      },
    ]);
    setLoading(false);
  }

  async function loadOrCreateBalance(month) {
    const res = await fetch(`/api/balances?month=${month}`);
    const data = await res.json();

    if (data) {
      setInitialBalance(parseFloat(data.initialBalance));
      return;
    }

    // No existe saldo para este mes
    if (month === FIRST_MONTH) {
      // Primer mes: pedir manualmente
      setShowBalanceModal(true);
    } else {
      // Mes posterior: calcular automáticamente
      const putRes = await fetch("/api/balances", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month }),
      });
      if (putRes.ok) {
        const created = await putRes.json();
        setInitialBalance(parseFloat(created.initialBalance));
      }
    }
  }

  async function handleSaveBalance() {
    const value = parseFloat(balanceInput);
    if (isNaN(value)) return;
    setSavingBalance(true);
    const res = await fetch("/api/balances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month: FIRST_MONTH, initialBalance: value }),
    });
    if (res.ok) {
      setInitialBalance(value);
      setShowBalanceModal(false);
    }
    setSavingBalance(false);
  }

  async function handleMonthChange(month) {
    setSelectedMonth(month);
    await loadAll(month);
  }

  const incomes  = transactions.filter((t) => t.type === "income");
  const expenses = transactions.filter((t) => t.type === "expense");
  const totalIngresos = incomes.reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalGastos   = expenses.reduce((s, t) => s + parseFloat(t.amount), 0);
  const balance       = (initialBalance ?? 0) + totalIngresos - totalGastos;
  const savingsPct    = totalIngresos > 0 ? ((totalIngresos - totalGastos) / totalIngresos) * 100 : 0;

  const expenseByCategory = Object.values(
    expenses.reduce((acc, t) => {
      const key = t.categoryName || "Sin categoría";
      if (!acc[key]) acc[key] = { name: key, value: 0 };
      acc[key].value += parseFloat(t.amount);
      return acc;
    }, {})
  );

  return (
    <div className={styles.container}>
      {showBalanceModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Saldo inicial</h2>
            <p className={styles.modalDesc}>
              Ingresa el saldo con el que comienzas a registrar tus finanzas en Abril 2026.
            </p>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={balanceInput}
              onChange={(e) => setBalanceInput(e.target.value)}
              className={styles.modalInput}
              autoFocus
            />
            <button
              onClick={handleSaveBalance}
              disabled={savingBalance || balanceInput === ""}
              className={styles.modalButton}
            >
              {savingBalance ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className={styles.appTitle}>Family Expenses</h1>
        </div>
        <div className={styles.headerRight}>
<button onClick={() => router.push("/transactions")} className={styles.navButton}>
            + Registrar
          </button>
          <button onClick={() => router.push("/categories")} className={styles.navButton}>
            Categorías
          </button>
          <button onClick={() => router.push("/")} className={styles.logoutButton}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Salir
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.welcomeSection}>
          <div>
            <h2 className={styles.welcomeTitle}>Resumen familiar</h2>
            <p className={styles.welcomeSubtitle}>Finanzas del mes seleccionado</p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => handleMonthChange(e.target.value)}
            className={styles.monthSelector}
          >
            {monthOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </section>

        <section className={styles.summaryCards}>
          <div className={`${styles.card} ${styles.startingCard}`}>
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Saldo inicial</span>
              <span className={styles.cardValue}>
                {initialBalance !== null ? fmt(initialBalance) : "—"}
              </span>
            </div>
          </div>

          <div className={`${styles.card} ${styles.incomeCard}`}>
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Ingresos</span>
              <span className={styles.cardValue}>{fmt(totalIngresos)}</span>
            </div>
          </div>

          <div className={`${styles.card} ${styles.expenseCard}`}>
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Egresos</span>
              <span className={styles.cardValue}>{fmt(totalGastos)}</span>
            </div>
          </div>

          <div className={`${styles.card} ${styles.balanceCard}`}>
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Balance</span>
              <span className={`${styles.cardValue} ${balance >= 0 ? styles.positive : styles.negative}`}>
                {fmt(balance)}
              </span>
            </div>
          </div>

          <div className={`${styles.card} ${styles.savingsCard}`}>
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
                <path d="M2 9v1c0 1.1.9 2 2 2h1" />
                <circle cx="16" cy="11" r="1" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Ahorro</span>
              <span className={styles.cardValue}>{savingsPct.toFixed(1)}%</span>
            </div>
          </div>
        </section>

        {mounted && (
          <section className={styles.chartsGrid}>
            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Ingresos vs Egresos</h3>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={monthlyTotals}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      formatter={(v, name, props) => [fmt(v), props.payload.name]}
                      contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {monthlyTotals.map((_entry, i) => (
                        <Cell key={i} fill={i === 0 ? "#43e97b" : "#f5576c"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={styles.chartCard}>
              <h3 className={styles.chartTitle}>Egresos por categoría</h3>
              {expenseByCategory.length === 0 ? (
                <p className={styles.emptyChart}>Sin egresos registrados este mes.</p>
              ) : (
                <div className={styles.chartContainer}>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {expenseByCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v) => [fmt(v), "Egreso"]}
                        contentStyle={{ borderRadius: "10px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </section>
        )}

        <section className={styles.categoryBreakdown}>
          <h3 className={styles.sectionTitle}>Últimas transacciones</h3>
          {loading ? (
            <p className={styles.emptyChart}>Cargando...</p>
          ) : transactions.length === 0 ? (
            <p className={styles.emptyChart}>Sin transacciones este mes.</p>
          ) : (
            <div className={styles.categoryList}>
              {transactions.slice(0, 10).map((t) => (
                <div key={t.id} className={styles.categoryItem}>
                  <div className={styles.categoryInfo}>
                    <div className={styles.categoryDot} style={{ backgroundColor: t.type === "income" ? "#43e97b" : "#f5576c" }} />
                    <div>
                      <span className={styles.categoryName}>{t.categoryName}</span>
                      {t.description && <span className={styles.txDesc}> · {t.description}</span>}
                    </div>
                  </div>
                  <span className={styles.txDate}>
                    {new Date(t.date).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                  </span>
                  <span className={`${styles.categoryValue} ${t.type === "income" ? styles.positive : styles.negative}`}>
                    {t.type === "income" ? "+" : "-"}{fmt(parseFloat(t.amount))}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
