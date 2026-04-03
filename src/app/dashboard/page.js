"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import styles from "./dashboard.module.css";

// Datos de ejemplo - gastos por mes
const monthlyData = [
  { month: "Ene", gastos: 2450, ingresos: 4500 },
  { month: "Feb", gastos: 2100, ingresos: 4500 },
  { month: "Mar", gastos: 2800, ingresos: 4800 },
  { month: "Abr", gastos: 2200, ingresos: 4500 },
  { month: "May", gastos: 2600, ingresos: 4700 },
  { month: "Jun", gastos: 2350, ingresos: 4500 },
];

// Datos de ejemplo - categorías del mes actual
const categoryData = [
  { name: "Alimentación", value: 850, color: "#667eea" },
  { name: "Servicios", value: 420, color: "#764ba2" },
  { name: "Transporte", value: 280, color: "#f093fb" },
  { name: "Entretenimiento", value: 180, color: "#f5576c" },
  { name: "Salud", value: 320, color: "#4facfe" },
  { name: "Otros", value: 300, color: "#43e97b" },
];

// Datos de comparación mensual por categoría
const categoryTrendData = [
  { month: "Ene", Alimentación: 780, Servicios: 400, Transporte: 250, Entretenimiento: 200 },
  { month: "Feb", Alimentación: 720, Servicios: 420, Transporte: 230, Entretenimiento: 150 },
  { month: "Mar", Alimentación: 890, Servicios: 450, Transporte: 300, Entretenimiento: 220 },
  { month: "Abr", Alimentación: 750, Servicios: 410, Transporte: 260, Entretenimiento: 180 },
  { month: "May", Alimentación: 820, Servicios: 430, Transporte: 290, Entretenimiento: 200 },
  { month: "Jun", Alimentación: 850, Servicios: 420, Transporte: 280, Entretenimiento: 180 },
];

export default function DashboardPage() {
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState("Junio 2025");

  const handleLogout = () => {
    router.push("/");
  };

  const totalGastos = categoryData.reduce((sum, cat) => sum + cat.value, 0);
  const totalIngresos = 4500;
  const balance = totalIngresos - totalGastos;

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h1 className={styles.appTitle}>Family Expenses</h1>
        </div>
        <div className={styles.headerRight}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Salir
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Welcome Section */}
        <section className={styles.welcomeSection}>
          <div>
            <h2 className={styles.welcomeTitle}>Resumen familiar</h2>
            <p className={styles.welcomeSubtitle}>
              Resumen financiero de tu familia - {selectedMonth}
            </p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={styles.monthSelector}
          >
            <option>Junio 2025</option>
            <option>Mayo 2025</option>
            <option>Abril 2025</option>
            <option>Marzo 2025</option>
            <option>Febrero 2025</option>
            <option>Enero 2025</option>
          </select>
        </section>

        {/* Summary Cards */}
        <section className={styles.summaryCards}>
          <div className={`${styles.card} ${styles.incomeCard}`}>
            <div className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.cardLabel}>Ingresos</span>
              <span className={styles.cardValue}>${totalIngresos.toLocaleString()}</span>
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
              <span className={styles.cardLabel}>Gastos</span>
              <span className={styles.cardValue}>${totalGastos.toLocaleString()}</span>
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
                ${balance.toLocaleString()}
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
              <span className={styles.cardValue}>{((balance / totalIngresos) * 100).toFixed(1)}%</span>
            </div>
          </div>
        </section>

        {/* Charts Grid */}
        <section className={styles.chartsGrid}>
          {/* Monthly Comparison Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Ingresos vs Gastos Mensuales</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="ingresos" fill="#43e97b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gastos" fill="#f5576c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className={styles.chartCard}>
            <h3 className={styles.chartTitle}>Gastos por Categoría - {selectedMonth}</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`$${value.toLocaleString()}`, "Gasto"]}
                    contentStyle={{
                      background: "rgba(255,255,255,0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Trend Chart */}
          <div className={`${styles.chartCard} ${styles.fullWidth}`}>
            <h3 className={styles.chartTitle}>Tendencia de Gastos por Categoría</h3>
            <div className={styles.chartContainer}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={categoryTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(255,255,255,0.95)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="Alimentación" stackId="1" stroke="#667eea" fill="#667eea" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Servicios" stackId="1" stroke="#764ba2" fill="#764ba2" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Transporte" stackId="1" stroke="#f093fb" fill="#f093fb" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="Entretenimiento" stackId="1" stroke="#f5576c" fill="#f5576c" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Category Breakdown */}
        <section className={styles.categoryBreakdown}>
          <h3 className={styles.sectionTitle}>Desglose por Categoría - {selectedMonth}</h3>
          <div className={styles.categoryList}>
            {categoryData.map((category) => (
              <div key={category.name} className={styles.categoryItem}>
                <div className={styles.categoryInfo}>
                  <div
                    className={styles.categoryDot}
                    style={{ backgroundColor: category.color }}
                  />
                  <span className={styles.categoryName}>{category.name}</span>
                </div>
                <div className={styles.categoryBar}>
                  <div
                    className={styles.categoryProgress}
                    style={{
                      width: `${(category.value / totalGastos) * 100}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
                <span className={styles.categoryValue}>${category.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
