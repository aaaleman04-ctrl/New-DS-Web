"use client";

import React, { useState, useEffect } from "react";
import AdminHeader from "./AdminHeader";
import SideBar from "./SideBar";
import styles from "@/styles/pages/admin.module.css";

interface AdminLayoutClientProps {
  displayName: string;
  roleLabel: string;
  avatarUrl?: string | null;
  email?: string | null;
  children: React.ReactNode;
}

export default function AdminLayoutClient({
  displayName,
  roleLabel,
  avatarUrl,
  email,
  children,
}: AdminLayoutClientProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Restore sidebar collapsed preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ds_sidebar_collapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const handleToggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("ds_sidebar_collapsed", String(next));
      return next;
    });
  };

  const handleToggleMobile = () => {
    setIsMobileOpen((prev) => !prev);
  };

  const handleCloseMobile = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className={styles.adminLayoutWrapper}>
      {/* HEADER SUPERIOR (100% Ancho) */}
      <AdminHeader
        displayName={displayName}
        roleLabel={roleLabel}
        avatarUrl={avatarUrl}
        email={email}
        isCollapsed={isCollapsed}
        onToggleSidebar={handleToggleSidebar}
        onToggleMobile={handleToggleMobile}
      />

      {/* CUERPO INFERIOR (Sidebar + Contenido Principal) */}
      <div className={styles.adminLayoutBody}>
        <SideBar
          isCollapsed={isCollapsed}
          isMobileOpen={isMobileOpen}
          onCloseMobile={handleCloseMobile}
        />

        <main
          className={`${styles.mainContent} ${
            isCollapsed ? styles.mainContentCollapsed : ""
          }`}
        >
          <div className={styles.contentArea}>{children}</div>
        </main>
      </div>
    </div>
  );
}
