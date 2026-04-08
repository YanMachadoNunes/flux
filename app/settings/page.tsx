"use client";

import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Palette,
  Bell,
  Building2,
  User,
  Moon,
  Sun,
  Check,
  Info,
} from "lucide-react";
import styles from "./settings.module.css";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [whatsapp, setWhatsapp] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!mounted) return <div className={styles.container} />;

  const themeOptions = [
    { id: "light", label: "Claro",  description: "Interface limpa e clara", icon: Sun  },
    { id: "dark",  label: "Escuro", description: "Ideal para ambientes com pouca luz", icon: Moon },
  ] as const;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <h1>Configurações</h1>
        <p>Personalize sua experiência no Flux</p>
      </header>

      <div className={styles.content}>

        {/* APARÊNCIA */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Palette size={14} />
            <h2>Aparência</h2>
          </div>
          <div className={styles.card}>
            <p className={styles.cardTitle}>Tema</p>
            <p className={styles.cardDescription}>Escolha o tema da interface</p>
            <div className={styles.themeGrid}>
              {themeOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = theme === option.id;
                return (
                  <button
                    key={option.id}
                    className={`${styles.themeOption} ${isSelected ? styles.selected : ""}`}
                    onClick={() => setTheme(option.id)}
                  >
                    <div className={`${styles.previewBox} ${styles[option.id]}`}>
                      <Icon size={26} />
                    </div>
                    <div className={styles.themeInfo}>
                      <h4>{option.label}</h4>
                      <p>{option.description}</p>
                    </div>
                    {isSelected && (
                      <div className={styles.checkmark}>
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* NOTIFICAÇÕES */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Bell size={14} />
            <h2>Notificações</h2>
          </div>
          <div className={styles.card}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <h4>Lembretes por WhatsApp</h4>
                <p>Enviar confirmações automáticas de consulta para pacientes</p>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.checked)}
                />
                <span className={styles.slider} />
              </label>
            </div>
          </div>
        </section>

        {/* DADOS DA CLÍNICA */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <Building2 size={14} />
            <h2>Dados da Clínica</h2>
          </div>
          <div className={`${styles.card} ${styles.cardPadded}`}>
            <div className={styles.inputGroup}>
              <label>Nome da Clínica</label>
              <input type="text" defaultValue="Clínica Experts" />
            </div>
            <div className={styles.inputGroup}>
              <label>CNPJ / Registro</label>
              <input type="text" placeholder="00.000.000/0000-00" />
            </div>
            <div className={styles.inputGroup}>
              <label>Telefone</label>
              <input type="text" placeholder="(11) 99999-9999" />
            </div>
            <button
              className={`${styles.saveBtn} ${saved ? styles.saved : ""}`}
              onClick={handleSave}
            >
              {saved ? <><Check size={14} /> Salvo!</> : "Salvar Alterações"}
            </button>
          </div>
        </section>

        {/* PERFIL */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <User size={14} />
            <h2>Perfil</h2>
          </div>
          <div className={`${styles.card} ${styles.cardPadded}`}>
            <div className={styles.profileSection}>
              <div className={styles.avatar}>D</div>
              <div className={styles.profileInfo}>
                <h4>Doutor</h4>
                <p>Profissional · Clínica Experts</p>
              </div>
            </div>
            <div className={styles.inputGroup} style={{ marginTop: "1.25rem" }}>
              <label>Nome</label>
              <input type="text" defaultValue="Doutor" />
            </div>
            <div className={styles.inputGroup}>
              <label>E-mail</label>
              <input type="email" placeholder="doutor@clinica.com" />
            </div>
            <button className={styles.saveBtn} onClick={handleSave}>
              Atualizar Perfil
            </button>
          </div>
        </section>

        {/* SISTEMA */}
        <section className={styles.section}>
          <div className={styles.card}>
            <p className={styles.cardTitle} style={{ paddingTop: "1.25rem" }}>
              <Info size={14} style={{ display: "inline", marginRight: "0.4rem", verticalAlign: "middle" }} />
              Sobre o Flux
            </p>
            <div className={styles.systemInfo}>
              <div className={styles.infoRow}>
                <span>Versão</span>
                <span>0.1.0</span>
              </div>
              <div className={styles.infoRow}>
                <span>Framework</span>
                <span>Next.js 16</span>
              </div>
              <div className={styles.infoRow}>
                <span>Banco de dados</span>
                <span>PostgreSQL</span>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
