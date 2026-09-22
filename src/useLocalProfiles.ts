import { useCallback, useEffect, useState } from "react";

const PROFILE_KEY = "forge-local-profiles-v1";
const SESSION_KEY = "forge-active-profile-v1";

export type LearnerProfile = {
  id: string;
  fullName: string;
  username: string;
  level:
    "Complete Beginner" | "Beginner" | "Intermediate" | "Experienced Developer";
  goal:
    | "Learn From Zero"
    | "Become Full-Stack Developer"
    | "Become Full-Stack AI Developer"
    | "Become AI Engineer"
    | "Build AI Products"
    | "Prepare for Development Interviews";
  dailyGoal: "30 Minutes" | "1 Hour" | "2 Hours" | "3+ Hours";
  speed: "Relaxed" | "Normal" | "Intensive";
  createdAt: string;
};

function readProfiles(): LearnerProfile[] {
  try {
    const parsed: unknown = JSON.parse(
      localStorage.getItem(PROFILE_KEY) ?? "[]",
    );
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is LearnerProfile =>
      Boolean(
        value &&
        typeof value === "object" &&
        typeof (value as LearnerProfile).id === "string" &&
        typeof (value as LearnerProfile).fullName === "string" &&
        typeof (value as LearnerProfile).username === "string",
      ),
    );
  } catch {
    return [];
  }
}

export function useLocalProfiles() {
  const [profiles, setProfiles] = useState<LearnerProfile[]>(readProfiles);
  const [activeId, setActiveId] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY),
  );
  const activeProfile =
    profiles.find((profile) => profile.id === activeId) ?? null;

  useEffect(
    () => localStorage.setItem(PROFILE_KEY, JSON.stringify(profiles)),
    [profiles],
  );
  useEffect(() => {
    if (activeId) localStorage.setItem(SESSION_KEY, activeId);
    else localStorage.removeItem(SESSION_KEY);
  }, [activeId]);

  const createProfile = useCallback(
    (details: Omit<LearnerProfile, "id" | "createdAt">) => {
      const profile: LearnerProfile = {
        ...details,
        id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
      };
      setProfiles((current) => [...current, profile]);
      setActiveId(profile.id);
    },
    [],
  );

  const activateCloudProfile = useCallback(
    (account: { id: string; fullName: string; username: string }) => {
      setProfiles((current) => {
        const existing = current.find((profile) => profile.id === account.id);
        const profile: LearnerProfile = existing
          ? {
              ...existing,
              fullName: account.fullName,
              username: account.username,
            }
          : {
              id: account.id,
              fullName: account.fullName,
              username: account.username,
              level: "Complete Beginner",
              goal: "Become Full-Stack AI Developer",
              dailyGoal: "1 Hour",
              speed: "Normal",
              createdAt: new Date().toISOString(),
            };
        return [...current.filter((item) => item.id !== account.id), profile];
      });
      setActiveId(account.id);
    },
    [],
  );

  return {
    profiles,
    activeProfile,
    createProfile,
    activateCloudProfile,
    login: setActiveId,
    logout: () => setActiveId(null),
  };
}
