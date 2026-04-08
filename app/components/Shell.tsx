"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { ThemeToggle } from "./ThemeToggle";
import { TrialBanner } from "./TrialBanner";
import { Menu } from "lucide-react";

const PUBLIC_PATHS = ["/login", "/register", "/plans"];

function MainContent({ children }: { children: ReactNode }) {
  const { toggleMobile, isMobile, isCollapsed } = useSidebar();

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          marginLeft: isMobile ? 0 : isCollapsed ? "72px" : "260px",
          width: "100%",
          minHeight: "100vh",
          transition: isMobile ? "none" : "margin-left 0.3s ease",
          overflowX: "hidden",
        }}
      >
        {/* Topbar */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 40,
            background: "var(--bg-primary)",
            borderBottom: "1px solid var(--border-color)",
            padding: "0.6rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          {isMobile && (
            <button
              onClick={toggleMobile}
              style={{
                flexShrink: 0,
                background: "var(--accent-primary)",
                border: "none",
                borderRadius: "8px",
                padding: "0.45rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                boxShadow: "0 2px 8px var(--shadow-color-strong)",
              }}
            >
              <Menu size={20} />
            </button>
          )}
          <span
            style={{
              fontSize: "0.82rem",
              color: "var(--text-muted)",
              fontWeight: 500,
            }}
          >
            Flux · Clínica Experts
          </span>
          <div style={{ marginLeft: "auto" }}>
            <ThemeToggle />
          </div>
        </div>

        <TrialBanner />
        {children}
      </main>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isPublic) return <>{children}</>;

  return (
    <SidebarProvider>
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}
