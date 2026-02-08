import React, { useState } from "react";
import { Palette } from "lucide-react";
import { themes } from "../../themes/themeConfig";
import { useTheme } from "../../contexts/ThemeContext";

export function ThemeSwitcher() {
  const { currentTheme, changeTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeName: any) => {
    changeTheme(themeName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition-colors hover:bg-opacity-10"
        style={{
          background: isOpen ? "var(--color-surface)" : "transparent",
        }}
        aria-label="Change theme"
      >
        <Palette className="w-5 h-5" style={{ color: "var(--color-text)" }} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute right-0 mt-2 w-72 rounded-2xl shadow-xl z-50 overflow-hidden"
            style={{
              background: "var(--color-card)",
              border: "1px solid var(--color-border)",
              boxShadow: "var(--shadow-xl)",
            }}
          >
            <div
              className="p-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <h3
                className="font-semibold text-base"
                style={{ color: "var(--color-text)" }}
              >
                Choose Your Theme
              </h3>
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-text-light)" }}
              >
                Select a visual style for PetMate
              </p>
            </div>
            <div className="p-2">
              {themes.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleThemeChange(theme.name)}
                  className="w-full text-left px-4 py-3 rounded-xl transition-all hover:scale-[1.02]"
                  style={{
                    background:
                      currentTheme === theme.name
                        ? "var(--color-surface)"
                        : "transparent",
                    border:
                      currentTheme === theme.name
                        ? "2px solid var(--color-primary)"
                        : "2px solid transparent",
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Theme Color Preview */}
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded-lg"
                        style={{
                          background:
                            theme.name === "lavender"
                              ? "#B19CD9"
                              : theme.name === "friendly"
                              ? "#D4745C"
                              : theme.name === "bold"
                              ? "#6C5CE7"
                              : "#6A4C93",
                        }}
                      />
                      <div
                        className="w-6 h-6 rounded-lg"
                        style={{
                          background:
                            theme.name === "lavender"
                              ? "#E6E6FA"
                              : theme.name === "friendly"
                              ? "#7C9885"
                              : theme.name === "bold"
                              ? "#FF6B9D"
                              : "#FFD700",
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <div
                        className="font-semibold text-sm"
                        style={{ color: "var(--color-text)" }}
                      >
                        {theme.label}
                      </div>
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: "var(--color-text-light)" }}
                      >
                        {theme.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
