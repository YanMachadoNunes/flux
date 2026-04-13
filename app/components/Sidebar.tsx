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
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import styles from "./sidebar.module.css";
import { useSidebar } from "../context/SidebarContext";

const menuItems = [
  { icon: Home,        label: "Visão Geral",    path: "/" },
  { icon: Calendar,   label: "Agenda",          path: "/agenda" },
  { icon: Users,      label: "Pacientes",       path: "/patients" },
  { icon: Stethoscope,label: "Procedimentos",   path: "/procedures" },
  { icon: DollarSign, label: "Financeiro",      path: "/financial" },
  { icon: Settings,   label: "Configurações",   path: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isMobileOpen, closeMobile, isMobile } = useSidebar();

  return (
    <>
      {isMobile && (
        <div
          className={`${styles.mobileOverlay} ${isMobileOpen ? styles.active : ""}`}
          onClick={closeMobile}
        />
      )}

      <aside
        className={`
          ${styles.sidebar}
          ${isCollapsed ? styles.collapsed : ""}
          ${isMobile ? (isMobileOpen ? styles.mobileOpen : "") : ""}
        `}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>F</div>
            {!isCollapsed && <span className={styles.logoText}>Flux</span>}
          </div>

          {!isMobile && (
            <button onClick={toggleSidebar} className={styles.collapseBtn} title={isCollapsed ? "Expandir" : "Recolher"}>
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
          {isMobile && (
            <button onClick={closeMobile} className={styles.collapseBtn}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className={styles.nav}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`${styles.link} ${isActive ? styles.active : ""}`}
                title={isCollapsed && !isMobile ? item.label : ""}
                onClick={() => { if (isMobile) closeMobile(); }}
              >
                <span className={styles.linkIcon}><Icon size={18} /></span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>
              <User size={16} />
            </div>
            {!isCollapsed && (
              <div className={styles.userDetails}>
                <span className={styles.userName}>Doutor</span>
                <span className={styles.userMeta}>Profissional</span>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className={styles.logoutBtn}
              title="Sair"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
