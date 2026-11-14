import { useState } from 'react';
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
import { colors } from './theme';

export function ScreenContainer({ children, scroll = true, contentStyle = null }) {
  const content = <View style={[styles.page, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        {scroll ? (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            style={styles.scrollView}
          >
            {content}
          </ScrollView>
        ) : content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function ScreenTitle({ eyebrow = null, title, subtitle = null, right = null }) {
  return (
    <View style={styles.screenTitleRow}>
      <View style={styles.screenTitleCopy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.screenTitle}>{title}</Text>
        {subtitle ? <Text style={styles.screenSubtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export function SectionTitle({ title, actionLabel = null, onAction = null }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          onPress={onAction}
          style={styles.textAction}
        >
          <Text style={styles.textActionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function AppButton({ label, accessibilityLabel = label, onPress, secondary = false, disabled = false, style = null }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary ? styles.buttonSecondary : styles.buttonPrimary,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.buttonPressed,
        style,
      ]}
    >
      <Text style={[styles.buttonLabel, secondary && styles.buttonSecondaryLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SearchField({ value, onChangeText, placeholder, accessibilityLabel }) {
  return (
    <View style={styles.searchField}>
      <Text style={styles.searchIcon} accessibilityElementsHidden importantForAccessibility="no">
        ⌕
      </Text>
      <TextInput
        accessibilityLabel={accessibilityLabel || placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        returnKeyType="search"
        style={styles.searchInput}
        value={value}
      />
    </View>
  );
}

/**
 * @param {{ label: string, value: string, onChangeText: (value: string) => void, placeholder?: string, error?: string | null, keyboardType?: import('react-native').KeyboardTypeOptions, autoCapitalize?: import('react-native').AutoCapitalize, multiline?: boolean }} props
 */
export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error = null,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
}) {
  return (
    <View style={styles.formField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error || undefined}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={[styles.formInput, multiline && styles.formInputMultiline, error && styles.formInputError]}
        value={value}
      />
      {error ? <Text accessibilityRole="alert" style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

export function SelectField({ label, value, options, onChange }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.selectWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((open) => !open)}
        style={({ pressed }) => [styles.selectButton, pressed && styles.buttonPressed]}
      >
        <Text numberOfLines={1} style={styles.selectValue}>{value}</Text>
        <Text style={styles.selectChevron}>{expanded ? '⌃' : '⌄'}</Text>
      </Pressable>
      {expanded ? (
        <ScrollView
          accessibilityLabel={`${label} options`}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          style={styles.selectOptions}
        >
          {options.map((option) => {
            const selected = option === value;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  onChange(option);
                  setExpanded(false);
                }}
                style={[styles.selectOption, selected && styles.selectOptionSelected]}
              >
                <Text style={[styles.selectOptionText, selected && styles.selectOptionSelectedText]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

export function FilterChip({ label, accessibilityLabel = label, selected = false, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={3}
      onPress={onPress}
      style={({ pressed }) => [
        styles.filterChip,
        selected && styles.filterChipSelected,
        pressed && styles.chipPressed,
      ]}
    >
      <Text style={[styles.filterChipText, selected && styles.filterChipSelectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function FilterChipRow({ children }) {
  return (
    <ScrollView
      contentContainerStyle={styles.chipRow}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function ShopCard({ shop, onPress = null, compact = false }) {
  const content = (
    <>
      <View style={styles.cardTopRow}>
        <View style={styles.shopMark}>
          <Text style={styles.shopMarkText}>{shop.shop_name?.slice(0, 1)?.toUpperCase() || 'S'}</Text>
        </View>
        <View style={styles.cardMain}>
          <Text numberOfLines={1} style={styles.cardTitle}>{shop.shop_name}</Text>
          <Text numberOfLines={1} style={styles.cardMeta}>{shop.district_name}</Text>
        </View>
        {onPress ? <Text style={styles.cardArrow}>›</Text> : null}
      </View>
      {!compact ? <Text numberOfLines={2} style={styles.cardBody}>{shop.address}</Text> : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.card, compact && styles.compactCard]}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${shop.shop_name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, compact && styles.compactCard, pressed && styles.cardPressed]}
    >
      {content}
    </Pressable>
  );
}

export function ProductCard({ product, compact = false, onShopPress = null }) {
  const inStock = Number(product.available) === 1;
  return (
    <View style={[styles.card, compact && styles.compactCard]}>
      <View style={styles.productTopRow}>
        <View style={styles.cardMain}>
          <Text numberOfLines={2} style={styles.cardTitle}>{product.product_name}</Text>
          <Text numberOfLines={1} style={styles.cardMeta}>
            {product.brand} · {product.category}
          </Text>
        </View>
        <View style={[styles.stockBadge, inStock ? styles.stockAvailable : styles.stockUnavailable]}>
          <Text style={[styles.stockText, inStock ? styles.stockTextAvailable : styles.stockTextUnavailable]}>
            {inStock ? 'In stock' : 'Out of stock'}
          </Text>
        </View>
      </View>
      <Text style={styles.price}>{formatLkr(product.price_lkr_cents)}</Text>
      {product.shop_name ? (
        <Pressable
          accessibilityRole={onShopPress ? 'button' : undefined}
          accessibilityLabel={onShopPress ? `View ${product.shop_name}` : undefined}
          disabled={!onShopPress}
          hitSlop={4}
          onPress={onShopPress}
          style={styles.productShopRow}
        >
          <Text numberOfLines={1} style={[styles.productShop, onShopPress && styles.productShopLink]}>
            {product.shop_name}{product.district_name ? ` · ${product.district_name}` : ''}
          </Text>
          {onShopPress ? <Text style={styles.cardArrow}>›</Text> : null}
        </Pressable>
      ) : null}
    </View>
  );
}

export function QueryStatus({ isLoading, error, empty, emptyTitle = null, emptyMessage = null, onRetry = null }) {
  if (!isLoading && !error && !empty) {
    return null;
  }

  if (isLoading) {
    return (
      <View style={styles.statusCard}>
        <ActivityIndicator color={colors.forest} size="large" />
        <Text style={styles.statusTitle}>Loading nearby gear…</Text>
        <Text style={styles.statusMessage}>This should only take a moment.</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>We couldn’t load this list</Text>
        <Text style={styles.statusMessage}>{error.message || 'Check your database and try again.'}</Text>
        <AppButton label="Retry" onPress={onRetry} style={styles.statusButton} />
      </View>
    );
  }

  return (
    <View style={styles.statusCard}>
      <View style={styles.emptyMark}><Text style={styles.emptyMarkText}>⌕</Text></View>
      <Text style={styles.statusTitle}>{emptyTitle || 'Nothing to show yet'}</Text>
      <Text style={styles.statusMessage}>{emptyMessage || 'Try changing your filters.'}</Text>
      {onRetry ? (
        <AppButton label="Refresh" secondary onPress={onRetry} style={styles.statusButton} />
      ) : null}
    </View>
  );
}

export function formatLkr(priceCents) {
  const value = Math.max(0, Math.trunc(Number(priceCents) || 0));
  const whole = Math.floor(value / 100).toLocaleString('en-US');
  const cents = String(value % 100).padStart(2, '0');
  return `LKR ${whole}.${cents}`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  page: {
    alignSelf: 'center',
    gap: 22,
    maxWidth: 1024,
    width: '100%',
  },
  screenTitleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  screenTitleCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.green,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
    marginBottom: 7,
  },
  screenTitle: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '800',
  },
  screenSubtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    maxWidth: 620,
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 19,
    fontWeight: '800',
  },
  textAction: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 6,
  },
  textActionLabel: {
    color: colors.green,
    fontSize: 14,
    fontWeight: '700',
  },
  button: {
    alignItems: 'center',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  buttonPrimary: {
    backgroundColor: colors.forest,
  },
  buttonSecondary: {
    backgroundColor: colors.mint,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonDisabled: {
    opacity: 0.56,
  },
  buttonPressed: {
    opacity: 0.78,
  },
  buttonLabel: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
  buttonSecondaryLabel: {
    color: colors.forest,
  },
  searchField: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 14,
  },
  searchIcon: {
    color: colors.green,
    fontSize: 25,
    marginRight: 10,
  },
  searchInput: {
    color: colors.ink,
    flex: 1,
    fontSize: 16,
    minHeight: 48,
    paddingVertical: 8,
  },
  selectWrap: {
    minWidth: 180,
    position: 'relative',
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  formField: {
    gap: 2,
  },
  formInput: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.ink,
    fontSize: 16,
    minHeight: 50,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  formInputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  formInputError: {
    borderColor: colors.danger,
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  selectButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  selectValue: {
    color: colors.ink,
    flex: 1,
    fontSize: 15,
  },
  selectChevron: {
    color: colors.forest,
    fontSize: 22,
    marginLeft: 8,
  },
  selectOptions: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 4,
    marginTop: 5,
    maxHeight: 220,
    zIndex: 10,
  },
  selectOption: {
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 13,
  },
  selectOptionSelected: {
    backgroundColor: colors.mint,
  },
  selectOptionText: {
    color: colors.ink,
    fontSize: 14,
  },
  selectOptionSelectedText: {
    color: colors.forest,
    fontWeight: '800',
  },
  chipRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 42,
    paddingHorizontal: 15,
  },
  filterChipSelected: {
    backgroundColor: colors.mint,
    borderColor: colors.forest,
  },
  filterChipText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  filterChipSelectedText: {
    color: colors.forest,
  },
  chipPressed: {
    opacity: 0.75,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  compactCard: {
    padding: 14,
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  shopMark: {
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: 13,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  shopMarkText: {
    color: colors.forest,
    fontSize: 17,
    fontWeight: '800',
  },
  cardMain: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  cardMeta: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 4,
  },
  cardBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12,
  },
  cardArrow: {
    color: colors.green,
    fontSize: 24,
    marginLeft: 8,
  },
  cardPressed: {
    borderColor: colors.green,
    opacity: 0.82,
  },
  productTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  stockBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stockAvailable: {
    backgroundColor: colors.mint,
  },
  stockUnavailable: {
    backgroundColor: colors.dangerBackground,
  },
  stockText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stockTextAvailable: {
    color: colors.forest,
  },
  stockTextUnavailable: {
    color: colors.danger,
  },
  price: {
    color: colors.forest,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  productShopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    minHeight: 32,
  },
  productShop: {
    color: colors.muted,
    flex: 1,
    fontSize: 13,
  },
  productShopLink: {
    color: colors.green,
    fontWeight: '700',
  },
  statusCard: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    maxWidth: 480,
    padding: 24,
    width: '100%',
  },
  statusTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 12,
    textAlign: 'center',
  },
  statusMessage: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    textAlign: 'center',
  },
  statusButton: {
    marginTop: 16,
    minWidth: 132,
  },
  emptyMark: {
    alignItems: 'center',
    backgroundColor: colors.mint,
    borderRadius: 20,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  emptyMarkText: {
    color: colors.forest,
    fontSize: 30,
  },
});
