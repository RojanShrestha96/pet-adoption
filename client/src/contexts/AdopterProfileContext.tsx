import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdopterPersonalInfo {
  fullName?: string;
  phone?: string;
  age?: number;
  address?: string;
  idType?: string;
  idNumber?: string;
  idDocuments?: string[];
}

export interface AdopterHousehold {
  homeType?: string;
  // V2.1 New Housing schema
  housing?: {
    type?: string;
    landlordPermission?: boolean;
  };
  rentOwn?: string; // legacy
  landlordPermission?: string[]; // legacy file upload
  hasChildren?: boolean;
  childrenAges?: string[]; // V2.1
  childrenDetails?: string;
  // V2.1 explicit pet booleans
  hasDogs?: boolean;
  hasCats?: boolean;
  hasSmallAnimals?: boolean;
  existingPets?: string; // legacy text
  hasFencedYard?: boolean;
  safeEnvironment?: boolean;
  medicalAffordability?: boolean;
  annualVaccinations?: boolean;
  proofOfResidence?: string[];
}

export interface AdopterLifestyle {
  activityLevel?: string;
  monthlyPetBudget?: string; // V2.1
  hoursAwayPerDay?: number;
  experienceLevel?: string;
  dailyRoutine?: string;
}

export interface AdopterProfile {
  exists: boolean;
  _id?: string;
  adopter?: string;
  email?: string;
  name?: string;
  /** Address from the User account — used to pre-fill personalInfo.address */
  userAddress?: string | null;
  /** Phone from the User account — used to pre-fill personalInfo.phone */
  userPhone?: string | null;
  personalInfo?: AdopterPersonalInfo;
  household?: AdopterHousehold;
  lifestyle?: AdopterLifestyle;
  completionStatus: "none" | "partial" | "complete";
  completedSections: string[];
  lastUpdated?: string;
}

export type ProfileStatus = "loading" | "none" | "partial" | "complete";

interface AdopterProfileContextType {
  profile: AdopterProfile | null;
  profileStatus: ProfileStatus;
  refreshProfile: () => Promise<void>;
  saveProfile: (data: {
    personalInfo?: AdopterPersonalInfo;
    household?: AdopterHousehold;
    lifestyle?: AdopterLifestyle;
  }) => Promise<AdopterProfile>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AdopterProfileContext = createContext<AdopterProfileContextType | undefined>(
  undefined
);

export const AdopterProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<AdopterProfile | null>(null);
  const [profileStatus, setProfileStatus] = useState<ProfileStatus>("loading");

  const fetchProfile = useCallback(async () => {
    if (!token || user?.type !== "adopter") {
      setProfileStatus("none");
      return;
    }
    try {
      const api = (await import("../utils/api")).default;
      const res = await api.get("/auth/adopter-profile");
      const data: AdopterProfile = res.data;
      setProfile(data);
      setProfileStatus((data.completionStatus as ProfileStatus) ?? "none");
    } catch (err) {
      console.warn("Could not load adopter profile:", err);
      setProfileStatus("none");
    }
  }, [token, user?.type]);

  // Fetch whenever user/token changes
  useEffect(() => {
    if (user?.type === "adopter") {
      fetchProfile();
    } else {
      setProfile(null);
      setProfileStatus("none");
    }
  }, [user?.type, token]);

  const saveProfile = useCallback(
    async (data: {
      personalInfo?: AdopterPersonalInfo;
      household?: AdopterHousehold;
      lifestyle?: AdopterLifestyle;
    }) => {
      const api = (await import("../utils/api")).default;
      const res = await api.put("/auth/adopter-profile", data);
      const savedProfile: AdopterProfile = res.data.profile;
      setProfile(savedProfile);
      setProfileStatus((savedProfile.completionStatus as ProfileStatus) ?? "none");
      return savedProfile;
    },
    []
  );

  const value = useMemo(
    () => ({ profile, profileStatus, refreshProfile: fetchProfile, saveProfile }),
    [profile, profileStatus, fetchProfile, saveProfile]
  );

  return (
    <AdopterProfileContext.Provider value={value}>
      {children}
    </AdopterProfileContext.Provider>
  );
};

export const useAdopterProfile = () => {
  const ctx = useContext(AdopterProfileContext);
  if (!ctx) throw new Error("useAdopterProfile must be used inside AdopterProfileProvider");
  return ctx;
};
