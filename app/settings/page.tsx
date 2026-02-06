"use client";

import styles from "./settings.module.css";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Configurações</h1>
        <p className={styles.subtitle}>
          Gerencie as preferências do seu sistema e os dados da clínica.
        </p>
      </header>

      <div className={styles.grid}>
        {/* Seção Clínica */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Dados da Clínica</h2>
          <div className={styles.card}>
            {/* Aqui entraremos com o formulário depois */}
            <div className={styles.inputGroup}>
              <label>Nome da Clínica</label>
              <input
                type="text"
                placeholder="Ex: Clínica Experts"
                defaultValue="Clínica Experts"
              />
            </div>
            <div className={styles.inputGroup}>
              <label>CNPJ / Registro</label>
              <input type="text" placeholder="00.000.000/0000-00" />
            </div>
            <button className={styles.saveBtn}>Salvar Alterações</button>
          </div>
        </section>

        {/* Seção Preferências */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Preferências do Sistema</h2>
          <div className={styles.card}>
            <div className={styles.settingItem}>
              <div>
                <strong>Notificações por WhatsApp</strong>
                <p>Enviar lembretes automáticos para pacientes.</p>
              </div>
              <input type="checkbox" defaultChecked />
            </div>
            <div className={styles.settingItem}>
              <div>
                <strong>Modo Escuro</strong>
                <p>Ajustar a interface para ambientes de baixa luz.</p>
              </div>
              <button 
                onClick={toggleTheme}
                className={styles.themeToggle}
                aria-label="Alternar modo escuro"
              >
                {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
                <span>{theme === "light" ? "Ativar" : "Desativar"}</span>
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
