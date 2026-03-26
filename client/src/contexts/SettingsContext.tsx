import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../utils/api";

interface SystemSettings {
  compatibilityIntelligenceEnabled: boolean;
}

interface SettingsContextType {
  settings: SystemSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: SystemSettings = {
  compatibilityIntelligenceEnabled: true,
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  loading: true,
  refreshSettings: async () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const res = await api.get("/settings/public");
      if (res.data.success && res.data.settings) {
        setSettings({
          compatibilityIntelligenceEnabled: res.data.settings.compatibilityIntelligenceEnabled ?? true,
        });
      }
    } catch (error) {
      console.error("Failed to load global settings", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};
