import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../auth/AuthProvider';
import {
  AppButton,
  FormField,
  ProductCard,
  QueryStatus,
  ScreenContainer,
  ScreenTitle,
  SectionTitle,
  SelectField,
  ShopCard,
} from '../../components/browse-ui';
import { colors } from '../../components/theme';
import { useDatabase } from '../../db/DatabaseGate';
import {
  createProduct,
  createShop,
  deleteProduct,
  deleteShop,
  getPersistedAdminSession,
  listDistricts,
  listProducts,
  listShops,
  updateProduct,
  updateShop,
} from '../../db/repository';
import { refreshDatabaseQueries } from '../../hooks/databaseRefresh';
import { useDatabaseQuery } from '../../hooks/useDatabaseQuery';
import { validateProductForm, validateShopForm } from '../../utils/managementValidation';

function shopFormFrom(shop = null, districts = []) {
  return {
    name: shop?.shop_name ?? '',
    district: shop?.district_name ?? districts[0]?.name ?? '',
    address: shop?.address ?? '',
    phone: shop?.phone ?? '',
  };
}

function productFormFrom(product = null, shops = []) {
  return {
    shopId: String(product?.shop_id ?? shops[0]?.shop_id ?? ''),
    name: product?.product_name ?? '',
    brand: product?.brand ?? '',
    category: product?.category ?? '',
    price: product ? (product.price_lkr_cents / 100).toFixed(2) : '',
    available: product ? Number(product.available) === 1 : true,
  };
}

export default function ManageScreen() {
  const database = useDatabase();
  const { account } = useAuth();
  const [shopEditor, setShopEditor] = useState(null);
  const [shopForm, setShopForm] = useState(/** @type {ReturnType<typeof shopFormFrom> | null} */ (null));
  const [shopErrors, setShopErrors] = useState(/** @type {any} */ ({}));
  const [productEditor, setProductEditor] = useState(null);
  const [productForm, setProductForm] = useState(/** @type {ReturnType<typeof productFormFrom> | null} */ (null));
  const [productErrors, setProductErrors] = useState(/** @type {any} */ ({}));
  const [confirmation, setConfirmation] = useState(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const busyRef = useRef(false);

  const loadManageData = useCallback(async () => {
    const [adminSession, districts, shops, products] = await Promise.all([
      getPersistedAdminSession(database),
      listDistricts(database),
      listShops(database),
      listProducts(database),
    ]);
    return { adminSession, districts, shops, products };
  }, [database]);
  const { data, error, isLoading, retry } = useDatabaseQuery(loadManageData);

  const authorized = account?.role === 'admin' && data?.adminSession?.id === account.id;

  function startShopEditor(shop = null) {
    setFeedback(null);
    setShopEditor(shop ? { id: shop.shop_id } : { id: null });
    setShopForm(shopFormFrom(shop, data?.districts ?? []));
    setShopErrors({});
    setProductEditor(null);
    setProductForm(null);
    setConfirmation(null);
  }

  function startProductEditor(product = null) {
    setFeedback(null);
    setProductEditor(product ? { id: product.product_id } : { id: null });
    setProductForm(productFormFrom(product, data?.shops ?? []));
    setProductErrors({});
    setShopEditor(null);
    setShopForm(null);
    setConfirmation(null);
  }

  function closeEditors() {
    setShopEditor(null);
    setShopForm(null);
    setShopErrors({});
    setProductEditor(null);
    setProductForm(null);
    setProductErrors({});
  }

  async function performMutation(mutation, successMessage) {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setFeedback(null);
    try {
      await mutation();
      setFeedback({ message: successMessage, isError: false });
      setConfirmation(null);
      closeEditors();
      refreshDatabaseQueries();
    } catch (mutationError) {
      setFeedback({ message: mutationError.message || 'The change could not be saved.', isError: true });
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function saveShop() {
    const { values, errors: nextErrors } = validateShopForm(shopForm, data.districts);
    setShopErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const districtId = data.districts.find((district) => district.name === values.district).id;
    const record = { ...values, districtId };
    const isEditing = shopEditor.id !== null;
    await performMutation(
      () => isEditing
        ? updateShop(database, shopEditor.id, record)
        : createShop(database, record),
      isEditing ? 'Shop changes saved.' : 'Shop added.',
    );
  }

  async function saveProduct() {
    const { values, errors: nextErrors } = validateProductForm(productForm, data.shops);
    setProductErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const isEditing = productEditor.id !== null;
    await performMutation(
      () => isEditing
        ? updateProduct(database, productEditor.id, values)
        : createProduct(database, values),
      isEditing ? 'Equipment changes saved.' : 'Equipment added.',
    );
  }

  function requestDelete(kind, record) {
    setConfirmation({ kind, id: record.shop_id ?? record.product_id, name: record.shop_name ?? record.product_name });
    setFeedback(null);
    closeEditors();
  }

  async function confirmDelete() {
    if (!confirmation) return;
    const { kind, id } = confirmation;
    const deletingShop = kind === 'shop';
    await performMutation(
      () => deletingShop ? deleteShop(database, id) : deleteProduct(database, id),
      deletingShop
        ? 'Shop and its equipment were deleted.'
        : 'Equipment deleted.',
    );
  }

  if (isLoading || error) {
    return (
      <ScreenContainer>
        <ScreenTitle eyebrow="ADMIN" title="Manage shops and equipment" />
        <QueryStatus isLoading={isLoading} error={error} empty={false} onRetry={retry} />
      </ScreenContainer>
    );
  }

  if (!authorized) {
    return (
      <ScreenContainer>
        <ScreenTitle eyebrow="ADMIN ACCESS" title="Manage shops and equipment" />
        <View style={styles.noticeCard}>
          <Text style={styles.noticeTitle}>Admin access required</Text>
          <Text style={styles.noticeText}>Only the signed-in admin can manage shops or equipment.</Text>
        </View>
        <AppButton label="Back to Home" onPress={() => router.replace('/home')} />
      </ScreenContainer>
    );
  }

  const districtNames = data.districts.map((district) => district.name);
  const shopOptions = data.shops.map((shop) => `${shop.shop_id}: ${shop.shop_name}`);
  const selectedShopOption = shopOptions.find((option) => option.startsWith(`${productForm?.shopId}: `)) ?? '';

  return (
    <ScreenContainer>
      <ScreenTitle
        eyebrow="ADMIN"
        title="Manage shops and equipment"
        subtitle="Keep local shop details and gear listings up to date."
      />

      {feedback ? (
        <View accessibilityRole={feedback.isError ? 'alert' : 'status'} style={[styles.feedback, feedback.isError && styles.feedbackError]}>
          <Text style={[styles.feedbackText, feedback.isError && styles.feedbackErrorText]}>{feedback.message}</Text>
        </View>
      ) : null}

      {confirmation ? (
        <View style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>Delete {confirmation.name}?</Text>
          <Text style={styles.confirmText}>
            {confirmation.kind === 'shop'
              ? 'Deleting this shop also deletes all equipment saved to it.'
              : 'This equipment listing will be permanently removed.'}
          </Text>
          <View style={styles.actionRow}>
            <AppButton label="Keep it" secondary disabled={busy} onPress={() => setConfirmation(null)} style={styles.actionButton} />
            <AppButton label={busy ? 'Deleting…' : 'Confirm delete'} disabled={busy} onPress={confirmDelete} style={[styles.actionButton, styles.deleteButton]} />
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <SectionTitle title="Shops" actionLabel="Add shop" onAction={() => startShopEditor()} />
        {shopEditor && shopForm ? (
          <View style={styles.editorCard}>
            <Text style={styles.editorTitle}>{shopEditor.id ? 'Edit shop' : 'Add a shop'}</Text>
            <FormField label="Shop name" value={shopForm.name} onChangeText={(name) => setShopForm((current) => ({ ...current, name }))} placeholder="e.g. City Sports" error={shopErrors.name} />
            <View>
              <SelectField label="District" value={shopForm.district} options={districtNames} onChange={(district) => setShopForm((current) => ({ ...current, district }))} />
              {shopErrors.district ? <Text accessibilityRole="alert" style={styles.fieldError}>{shopErrors.district}</Text> : null}
            </View>
            <FormField label="Address" value={shopForm.address} onChangeText={(address) => setShopForm((current) => ({ ...current, address }))} placeholder="Street address and area" error={shopErrors.address} multiline />
            <FormField label="Phone number" value={shopForm.phone} onChangeText={(phone) => setShopForm((current) => ({ ...current, phone }))} placeholder="+94 11 234 5678" error={shopErrors.phone} keyboardType="phone-pad" />
            <View style={styles.actionRow}>
              <AppButton label="Cancel" secondary disabled={busy} onPress={closeEditors} style={styles.actionButton} />
              <AppButton label={busy ? 'Saving…' : 'Save shop'} disabled={busy} onPress={saveShop} style={styles.actionButton} />
            </View>
          </View>
        ) : null}

        {data.shops.length > 0 ? data.shops.map((shop) => (
          <View key={shop.shop_id} style={styles.recordCard}>
            <ShopCard shop={shop} />
            <View style={styles.actionRow}>
              <AppButton label={`Edit ${shop.shop_name}`} secondary disabled={busy} onPress={() => startShopEditor(shop)} style={styles.actionButton} />
              <AppButton label={`Delete ${shop.shop_name}`} secondary disabled={busy} onPress={() => requestDelete('shop', shop)} style={[styles.actionButton, styles.deleteOutline]} />
            </View>
          </View>
        )) : (
          <Text style={styles.helperText}>No shops yet. Add a shop before listing equipment.</Text>
        )}
      </View>

      <View style={styles.section}>
        <SectionTitle
          title="Equipment"
          actionLabel={data.shops.length > 0 ? 'Add equipment' : null}
          onAction={startProductEditor}
        />
        {data.shops.length === 0 ? <Text style={styles.helperText}>Add a shop before creating an equipment listing.</Text> : null}
        {productEditor && productForm ? (
          <View style={styles.editorCard}>
            <Text style={styles.editorTitle}>{productEditor.id ? 'Edit equipment' : 'Add equipment'}</Text>
            <View>
              <SelectField
                label="Shop"
                value={selectedShopOption}
                options={shopOptions}
                onChange={(option) => setProductForm((current) => ({ ...current, shopId: option.split(':', 1)[0] }))}
              />
              {productErrors.shopId ? <Text accessibilityRole="alert" style={styles.fieldError}>{productErrors.shopId}</Text> : null}
            </View>
            <FormField label="Equipment name" value={productForm.name} onChangeText={(name) => setProductForm((current) => ({ ...current, name }))} placeholder="e.g. Match Football" error={productErrors.name} />
            <FormField label="Brand" value={productForm.brand} onChangeText={(brand) => setProductForm((current) => ({ ...current, brand }))} placeholder="e.g. Nivia" error={productErrors.brand} />
            <FormField label="Sport or category" value={productForm.category} onChangeText={(category) => setProductForm((current) => ({ ...current, category }))} placeholder="e.g. Football" error={productErrors.category} />
            <FormField label="Price (LKR)" value={productForm.price} onChangeText={(price) => setProductForm((current) => ({ ...current, price }))} placeholder="1299.50" error={productErrors.price} keyboardType="decimal-pad" autoCapitalize="none" />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="In stock"
              accessibilityState={{ checked: productForm.available }}
              onPress={() => setProductForm((current) => ({ ...current, available: !current.available }))}
              style={styles.stockChoice}
            >
              <View style={[styles.checkbox, productForm.available && styles.checkboxSelected]}>
                {productForm.available ? <Text style={styles.checkboxMark}>✓</Text> : null}
              </View>
              <Text style={styles.stockChoiceText}>In stock</Text>
            </Pressable>
            <View style={styles.actionRow}>
              <AppButton label="Cancel" secondary disabled={busy} onPress={closeEditors} style={styles.actionButton} />
              <AppButton label={busy ? 'Saving…' : 'Save equipment'} disabled={busy} onPress={saveProduct} style={styles.actionButton} />
            </View>
          </View>
        ) : null}

        {data.products.length > 0 ? data.products.map((product) => (
          <View key={product.product_id} style={styles.recordCard}>
            <ProductCard product={product} />
            <View style={styles.actionRow}>
              <AppButton label={`Edit ${product.product_name}`} secondary disabled={busy} onPress={() => startProductEditor(product)} style={styles.actionButton} />
              <AppButton label={`Delete ${product.product_name}`} secondary disabled={busy} onPress={() => requestDelete('product', product)} style={[styles.actionButton, styles.deleteOutline]} />
            </View>
          </View>
        )) : (
          <Text style={styles.helperText}>No equipment is listed yet.</Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  recordCard: {
    gap: 8,
  },
  editorCard: {
    backgroundColor: colors.mint,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    padding: 16,
  },
  editorTitle: {
    color: colors.forest,
    fontSize: 18,
    fontWeight: '800',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  deleteOutline: {
    borderColor: colors.danger,
  },
  confirmCard: {
    backgroundColor: colors.dangerBackground,
    borderColor: colors.danger,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  confirmTitle: {
    color: colors.danger,
    fontSize: 18,
    fontWeight: '800',
  },
  confirmText: {
    color: colors.ink,
    fontSize: 14,
    lineHeight: 21,
  },
  noticeCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
    padding: 20,
  },
  noticeTitle: {
    color: colors.forest,
    fontSize: 18,
    fontWeight: '800',
  },
  noticeText: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  feedback: {
    backgroundColor: colors.mint,
    borderRadius: 12,
    padding: 12,
  },
  feedbackError: {
    backgroundColor: colors.dangerBackground,
  },
  feedbackText: {
    color: colors.forest,
    fontSize: 14,
    fontWeight: '700',
  },
  feedbackErrorText: {
    color: colors.danger,
  },
  fieldError: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 5,
  },
  stockChoice: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 4,
  },
  checkbox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxSelected: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  checkboxMark: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
  stockChoiceText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  helperText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
