"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./categories.module.css";

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [activeTab, setActiveTab] = useState("expense");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  async function handleAdd(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), type: activeTab }),
    });

    if (res.ok) {
      const created = await res.json();
      setCategories((prev) => [...prev, created]);
      setNewName("");
    }
  }

  async function handleDelete(id) {
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  const filtered = categories.filter((c) => c.type === activeTab);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push("/dashboard")} className={styles.backButton}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Dashboard
        </button>
        <h1 className={styles.title}>Categorías</h1>
      </header>

      <main className={styles.main}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "expense" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("expense")}
          >
            Egresos
          </button>
          <button
            className={`${styles.tab} ${activeTab === "income" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("income")}
          >
            Ingresos
          </button>
        </div>

        <form onSubmit={handleAdd} className={styles.addForm}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`Nueva categoría de ${activeTab === "expense" ? "egreso" : "ingreso"}...`}
            className={styles.input}
            autoFocus
          />
          <button type="submit" className={styles.addButton} disabled={!newName.trim()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar
          </button>
        </form>

        {loading ? (
          <p className={styles.empty}>Cargando...</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>Sin categorías aún. Agrega una arriba.</p>
        ) : (
          <div className={styles.grid}>
            {filtered.map((cat) => (
              <div key={cat.id} className={`${styles.card} ${activeTab === "income" ? styles.incomeCard : styles.expenseCard}`}>
                <span className={styles.cardName}>{cat.name}</span>
                <button
                  onClick={() => handleDelete(cat.id)}
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
