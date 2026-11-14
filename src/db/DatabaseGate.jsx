import { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../components/theme';
import { BROWSER_STORAGE_UNAVAILABLE, DATABASE_IN_USE } from './browserAccess';
import { initializeDatabase } from './database';

const DatabaseContext = createContext(null);

export function useDatabase() {
  const database = useContext(DatabaseContext);
  if (!database) {
    throw new Error('useDatabase must be used inside DatabaseGate.');
  }
  return database;
}

export function DatabaseGate({ children }) {
  const [database, setDatabase] = useState(null);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;

    initializeDatabase()
      .then((openedDatabase) => {
        if (active) {
          setDatabase(openedDatabase);
        }
      })
      .catch((initializationError) => {
        if (active) {
          setError(initializationError);
        }
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  if (error) {
    const locked = error.code === DATABASE_IN_USE;
    const unsupported = error.code === BROWSER_STORAGE_UNAVAILABLE;
    const reload = Platform.OS === 'web' && !locked && !unsupported;
    const message = locked
      ? 'Use the other tab, or close it and select Retry here. Your saved data will stay on this device.'
      : unsupported
        ? 'Open this address directly in a browser that supports local storage, such as Chrome or Edge.'
        : reload
          ? 'Close any other SportFinder tabs, then reload this page to restart local storage.'
          : 'Check your device storage, then retry the database setup.';

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <Text accessibilityRole="header" style={styles.title}>
            {locked ? 'SportFinder is open in another tab' : 'SportFinder could not open its database'}
          </Text>
          <Text style={styles.message}>{message}</Text>
          {!locked && !unsupported && <Text style={styles.details}>{error.message}</Text>}
          {!unsupported && (
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (reload) {
                  window.location.reload();
                  return;
                }
                setError(null);
                setDatabase(null);
                setAttempt((currentAttempt) => currentAttempt + 1);
              }}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            >
              <Text style={styles.buttonText}>{reload ? 'Reload page' : 'Retry'}</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!database) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <ActivityIndicator color={colors.forest} size="large" />
          <Text accessibilityRole="text" style={styles.loadingText}>
            Preparing SportFinder…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return <DatabaseContext.Provider value={database}>{children}</DatabaseContext.Provider>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  title: {
    color: colors.ink,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  details: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 22,
  },
  loadingText: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 14,
  },
  button: {
    minHeight: 48,
    minWidth: 140,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: colors.forest,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
});
