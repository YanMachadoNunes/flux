"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar"; // AGORA COM CHAVES PARA BATER COM SEU EXPORT
import { SidebarProvider, useSidebar } from "../context/SidebarContext";

function MainContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();

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
          marginLeft: isCollapsed ? "80px" : "260px",
          width: "100%",
          minHeight: "100vh",
          transition: "margin-left 0.3s ease, background-color 0.3s ease",
          overflowX: "hidden",
        }}
      >
        {children}
      </main>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <MainContent>{children}</MainContent>
    </SidebarProvider>
  );
}
