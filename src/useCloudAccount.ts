import { useCallback, useEffect, useState } from "react";
import {
  ForgeApiError,
  forgeApi,
  type AccountUser,
  type CloudProfile,
} from "./services/forgeApi";

export function useCloudAccount() {
  const [user, setUser] = useState<AccountUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recoveryCode, setRecoveryCode] = useState<string | null>(null);
  const [profile, setProfile] = useState<CloudProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    let active = true;
    forgeApi
      .session()
      .then(({ user: account }) => {
        if (active) setUser(account);
      })
      .catch((reason: unknown) => {
        if (
          active &&
          (!(reason instanceof ForgeApiError) || reason.status !== 401)
        )
          setError(
            "Cloud accounts are temporarily unavailable. Local learning still works.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    setProfileLoading(true);
    try {
      const result = await forgeApi.profile();
      setProfile(result.profile);
      return result.profile;
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Profile request failed.",
      );
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    forgeApi
      .profile()
      .then((result) => {
        if (active) setProfile(result.profile);
      })
      .catch((reason: unknown) => {
        if (active)
          setError(
            reason instanceof Error
              ? reason.message
              : "Profile request failed.",
          );
      });
    return () => {
      active = false;
    };
  }, [user]);

  const run = useCallback(
    async (action: () => Promise<{ user: AccountUser }>) => {
      setLoading(true);
      setError(null);
      try {
        const result = await action();
        setProfile(null);
        setUser(result.user);
        return result.user;
      } catch (reason) {
        setError(
          reason instanceof Error ? reason.message : "Account request failed.",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    user,
    loading,
    error,
    clearError: () => setError(null),
    recoveryCode,
    profile,
    profileLoading,
    refreshProfile,
    register: async (input: Parameters<typeof forgeApi.register>[0]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await forgeApi.register(input);
        setRecoveryCode(result.recoveryCode);
        setProfile(null);
        setUser(result.user);
        return result.user;
      } catch (reason) {
        setError(
          reason instanceof Error ? reason.message : "Registration failed.",
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    login: (input: Parameters<typeof forgeApi.login>[0]) =>
      run(() => forgeApi.login(input)),
    recover: async (input: Parameters<typeof forgeApi.recover>[0]) => {
      setLoading(true);
      setError(null);
      try {
        const result = await forgeApi.recover(input);
        setRecoveryCode(result.recoveryCode);
        return true;
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Recovery failed.");
        return false;
      } finally {
        setLoading(false);
      }
    },
    logout: async () => {
      try {
        await forgeApi.logout();
      } finally {
        setUser(null);
        setProfile(null);
      }
    },
    saveOnboarding: async (
      input: Parameters<typeof forgeApi.saveOnboarding>[0],
    ) => {
      setProfileLoading(true);
      setError(null);
      try {
        const result = await forgeApi.saveOnboarding(input);
        return result;
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : "Could not save your roadmap.",
        );
        return null;
      } finally {
        setProfileLoading(false);
      }
    },
  };
}

export type CloudAccount = ReturnType<typeof useCloudAccount>;
