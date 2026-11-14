import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthProvider';
import { colors } from '../components/theme';

const ACCOUNT_TYPES = [
  { role: 'buyer', title: 'Create a User Account', description: 'Find gear, compare prices, and check stock.' },
  { role: 'shop_owner', title: 'Create a Shop Owner Account', description: 'List your shop and manage your products.' },
];

export default function LoginScreen() {
  const { createUserAccount, signIn } = useAuth();
  const [isNewAccount, setIsNewAccount] = useState(false);
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitting = useRef(false);
  const passwordInput = useRef(null);

  const title = isNewAccount ? 'Create an account' : 'Sign in';

  function clearError(field) {
    setError((current) => current?.field === field || current?.field === 'form' ? null : current);
  }

  async function submit() {
    if (submitting.current) return;
    if (isNewAccount && !role) {
      setError({ field: 'role', message: 'Choose how you want to use SportFinder.' });
      return;
    }
    submitting.current = true;
    setError(null);
    setIsSubmitting(true);

    try {
      if (isNewAccount) {
        await createUserAccount({ username, password }, role);
      } else {
        await signIn({ username, password });
      }
    } catch (submitError) {
      setError({
        field: submitError.field ?? 'form',
        message: submitError.message || 'Could not complete this action. Try again.',
      });
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  function switchScreen() {
    setIsNewAccount((current) => !current);
    setRole(null);
    setError(null);
    setPassword('');
    setShowPassword(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <View style={styles.brandMark}>
              <Text style={styles.brandMarkText}>S</Text>
            </View>
            <Text style={styles.brand}>SportFinder</Text>
            <Text accessibilityRole="header" style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              Find sports equipment across Sri Lanka.
            </Text>

            {isNewAccount && (
              <View style={styles.roleList} accessibilityRole="radiogroup" accessibilityLabel="Account type">
                <Text style={styles.rolePrompt}>Choose an account type</Text>
                {ACCOUNT_TYPES.map((type) => (
                  <Pressable
                    key={type.role}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: role === type.role }}
                    accessibilityLabel={type.title}
                    accessibilityHint={type.description}
                    disabled={isSubmitting}
                    onPress={() => {
                      setRole(type.role);
                      clearError('role');
                    }}
                    style={[styles.roleOption, role === type.role && styles.roleSelected]}
                  >
                    <View style={[styles.radio, role === type.role && styles.radioSelected]}>
                      {role === type.role && <View style={styles.radioDot} />}
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.roleTitle}>{type.title}</Text>
                      <Text style={styles.roleDescription}>{type.description}</Text>
                    </View>
                  </Pressable>
                ))}
                {error?.field === 'role' && <FormError message={error.message} />}
              </View>
            )}

            <Text style={styles.label}>Username</Text>
            <TextInput
              accessibilityLabel="Username"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={64}
              accessibilityHint={error?.field === 'username' ? error.message : undefined}
              editable={!isSubmitting}
              onChangeText={(value) => {
                setUsername(value);
                clearError('username');
              }}
              onSubmitEditing={() => passwordInput.current?.focus()}
              placeholder="Your username"
              placeholderTextColor={colors.muted}
              returnKeyType="next"
              style={[styles.input, error?.field === 'username' && styles.invalidInput]}
              textContentType="username"
              value={username}
            />
            {error?.field === 'username' && <FormError message={error.message} />}

            <Text style={styles.label}>Password</Text>
            <View style={[styles.passwordRow, error?.field === 'password' && styles.invalidInput]}>
              <TextInput
                ref={passwordInput}
                accessibilityLabel="Password"
                accessibilityHint={error?.field === 'password' ? error.message : undefined}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isSubmitting}
                onChangeText={(value) => {
                  setPassword(value);
                  clearError('password');
                }}
                onSubmitEditing={submit}
                placeholder={isNewAccount ? 'At least 8 characters' : 'Your password'}
                placeholderTextColor={colors.muted}
                returnKeyType="done"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                textContentType={isNewAccount ? 'newPassword' : 'password'}
                value={password}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                onPress={() => setShowPassword((current) => !current)}
                style={styles.passwordToggle}
              >
                <Text style={styles.linkText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </Pressable>
            </View>
            {error?.field === 'password' && <FormError message={error.message} />}
            {error?.field === 'form' && <FormError message={error.message} />}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isNewAccount ? 'Create account' : 'Sign in'}
              accessibilityState={{ busy: isSubmitting }}
              disabled={isSubmitting}
              onPress={submit}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && !isSubmitting && styles.pressed,
                isSubmitting && styles.disabled,
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.submitButtonText}>{isNewAccount ? 'Create account' : 'Sign in'}</Text>
              )}
            </Pressable>

            <View style={styles.footer}>
              <Text style={styles.hint}>{isNewAccount ? 'Already have an account?' : 'New to SportFinder?'}</Text>
              <Pressable accessibilityRole="button" disabled={isSubmitting} onPress={switchScreen} style={styles.footerButton}>
                <Text style={styles.linkText}>{isNewAccount ? 'Back to sign in' : 'Create an account'}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FormError({ message }) {
  return <Text accessibilityRole="alert" style={styles.error}>{message}</Text>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 24,
    borderWidth: 1,
    maxWidth: 440,
    padding: 24,
    width: '100%',
  },
  brandMark: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.forest,
    borderRadius: 18,
    height: 54,
    justifyContent: 'center',
    marginBottom: 10,
    width: 54,
  },
  brandMarkText: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: '800',
  },
  brand: {
    color: colors.forest,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  title: {
    color: colors.ink,
    fontSize: 25,
    fontWeight: '800',
    marginTop: 24,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 7,
    marginBottom: 14,
    textAlign: 'center',
  },
  roleList: {
    gap: 8,
    marginTop: 8,
  },
  rolePrompt: {
    color: colors.ink,
    fontWeight: '700',
  },
  roleOption: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  roleSelected: {
    backgroundColor: colors.mint,
    borderColor: colors.forest,
  },
  roleTitle: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  roleDescription: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 3,
  },
  radio: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.muted,
  },
  radioSelected: {
    borderColor: colors.forest,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.forest,
  },
  label: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  passwordRow: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    color: colors.ink,
    fontSize: 16,
    paddingHorizontal: 14,
  },
  passwordToggle: {
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  invalidInput: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: colors.forest,
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 20,
    minHeight: 52,
  },
  submitButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.82,
  },
  disabled: {
    opacity: 0.65,
  },
  footer: {
    alignItems: 'center',
    marginTop: 18,
  },
  footerButton: {
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 12,
  },
  linkText: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '700',
  },
  hint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
