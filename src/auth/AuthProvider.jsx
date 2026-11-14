import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  authenticateAccount,
  createAdminAccount,
  createBrowsingAccount,
  getAccountById,
  hasAdminAccount,
} from './accounts';
import { useDatabase } from '../db/DatabaseGate';
import { clearLocalSession, loadLocalSessionAccountId, saveLocalSession } from './session';

const AuthContext = createContext(null);

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return auth;
}

export function AuthProvider({ children }) {
  const database = useDatabase();
  const [account, setAccount] = useState(null);
  const [setupAvailable, setSetupAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadAuthState() {
      try {
        const [accountId, adminExists] = await Promise.all([
          loadLocalSessionAccountId(database),
          hasAdminAccount(database),
        ]);
        const restoredAccount = accountId ? await getAccountById(database, accountId) : null;

        if (!active) {
          return;
        }

        if (accountId && !restoredAccount) {
          await clearLocalSession(database);
        }
        setAccount(restoredAccount);
        setSetupAvailable(!adminExists);
      } catch (error) {
        if (active) {
          setBootstrapError(error);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadAuthState();
    return () => {
      active = false;
    };
  }, [database]);

  const startSession = useCallback(async (nextAccount) => {
    await saveLocalSession(database, nextAccount.id);
    setAccount(nextAccount);
    return nextAccount;
  }, [database]);

  const setupAdmin = useCallback(async (credentials) => {
    const nextAccount = await createAdminAccount(database, credentials);
    setSetupAvailable(false);
    return startSession(nextAccount);
  }, [database, startSession]);

  const createUserAccount = useCallback(async (credentials) => {
    const nextAccount = await createBrowsingAccount(database, credentials);
    return startSession(nextAccount);
  }, [database, startSession]);

  const signIn = useCallback(async (credentials) => {
    const nextAccount = await authenticateAccount(database, credentials);
    return startSession(nextAccount);
  }, [database, startSession]);

  const signOut = useCallback(async () => {
    await clearLocalSession(database);
    setAccount(null);
  }, [database]);

  const value = useMemo(() => ({
    account,
    bootstrapError,
    createUserAccount,
    isLoading,
    setupAdmin,
    setupAvailable,
    signIn,
    signOut,
  }), [
    account,
    bootstrapError,
    createUserAccount,
    isLoading,
    setupAdmin,
    setupAvailable,
    signIn,
    signOut,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
