import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthProvider';
import { colors } from '../components/theme';

export default function IndexScreen() {
  const { account, bootstrapError, isLoading } = useAuth();

  if (!isLoading && !bootstrapError) {
    return <Redirect href={account ? '/home' : '/login'} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        {bootstrapError ? (
          <>
            <Text style={styles.title}>Could not restore your local session</Text>
            <Text style={styles.message}>{bootstrapError.message}</Text>
          </>
        ) : (
          <>
            <ActivityIndicator color={colors.forest} size="large" />
            <Text style={styles.message}>Loading your account…</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
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
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 14,
  },
});
