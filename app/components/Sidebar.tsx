"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  Stethoscope,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";
import styles from "./sidebar.module.css";
import { useSidebar } from "../context/SidebarContext"; // Importe o contexto

const menuItems = [
  { icon: Home, label: "Visão Geral", path: "/" },
  { icon: Calendar, label: "Agenda", path: "/agenda" },
  { icon: Users, label: "Pacientes", path: "/patients" },
  { icon: Stethoscope, label: "Procedimentos", path: "/procedures" },
  { icon: DollarSign, label: "Financeiro", path: "/financial" },
  { icon: Settings, label: "Configurações", path: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""}`}
    >
      {/* Cabeçalho com Logo */}
      <div className={styles.header}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>F</div>
          {!isCollapsed && <span className={styles.logoText}>Flux</span>}
        </div>

        {/* Botão de Minimizar */}
        <button onClick={toggleSidebar} className={styles.collapseBtn}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`${styles.link} ${isActive ? styles.active : ""}`}
              title={isCollapsed ? item.label : ""} // Tooltip nativo quando fechado
            >
              <Icon size={20} />
              {!isCollapsed && (
                <span className={styles.label}>{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <div className={styles.avatar}>
          <User size={18} />
        </div>
        {!isCollapsed && (
          <div className={styles.user}>
            <span className={styles.userName}>Doutor</span>
            <span className={styles.userRole}>Profissional</span>
          </div>
        )}
      </div>
    </aside>
  );
}
