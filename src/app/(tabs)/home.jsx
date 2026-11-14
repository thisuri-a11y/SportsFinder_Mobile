import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthProvider';
import { colors } from '../../components/theme';

export default function HomeScreen() {
  const { account, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>SPORTFINDER ACCOUNT</Text>
          <Text style={styles.title}>Welcome, {account?.username}</Text>
          <Text style={styles.subtitle}>
            Your local account is ready for browsing sports equipment.
          </Text>
        </View>

        <View style={styles.card}>
          <AccountDetail label="Username" value={account?.username} />
          <AccountDetail
            label="Account type"
            value={account?.role === 'admin' ? 'Admin' : 'Browsing account'}
          />
          <AccountDetail label="Local account ID" value={String(account?.id ?? '')} />
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={signOut}
          style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function AccountDetail({ label, value }) {
  return (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignSelf: 'center',
    maxWidth: 440,
    width: '100%',
  },
  eyebrow: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.ink,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  card: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 26,
    maxWidth: 440,
    paddingHorizontal: 20,
    width: '100%',
  },
  detail: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: 16,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 13,
  },
  detailValue: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  signOutButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.forest,
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 22,
    maxWidth: 440,
    minHeight: 52,
    width: '100%',
  },
  signOutText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
});
