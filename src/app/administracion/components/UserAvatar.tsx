import React from "react";

type UserAvatarProps = {
  avatarUrl?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  email?: string | null;
  size?: number; // size in px
};

export default function UserAvatar({
  avatarUrl,
  nombres,
  apellidos,
  email,
  size = 36,
}: UserAvatarProps) {
  // Generate initials
  let initials = "U";
  if (nombres || apellidos) {
    if (nombres && !apellidos) {
      const parts = nombres.trim().split(/\s+/);
      if (parts.length > 1) {
        const first = parts[0].charAt(0);
        const last = parts[parts.length - 1].charAt(0);
        initials = `${first}${last}`.toUpperCase();
      } else {
        initials = nombres.trim().charAt(0).toUpperCase();
      }
    } else {
      const firstInitial = nombres?.trim().charAt(0) || "";
      const lastInitial = apellidos?.trim().charAt(0) || "";
      initials = `${firstInitial}${lastInitial}`.toUpperCase() || "U";
    }
  } else if (email) {
    initials = email.trim().charAt(0).toUpperCase();
  }

  const avatarStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "50%",
    backgroundColor: "var(--primaryLight)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--primaryColor)",
    fontWeight: "bold",
    fontSize: size > 48 ? "1.8rem" : "1.4rem",
    overflow: "hidden",
    flexShrink: 0,
    border: "2px solid var(--white)",
    boxShadow: "var(--shadow-sm)",
  };

  if (avatarUrl) {
    return (
      <div style={avatarStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={nombres ? `${nombres} ${apellidos || ""}` : "Avatar de usuario"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.currentTarget.style.display = "none";
            const parent = e.currentTarget.parentElement;
            if (parent) {
              const span = document.createElement("span");
              span.innerText = initials;
              parent.appendChild(span);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div style={avatarStyle}>
      <span>{initials}</span>
    </div>
  );
}
