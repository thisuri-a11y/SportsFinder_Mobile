import { useCallback, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppButton, ProductCard, QueryStatus, ScreenContainer, ScreenTitle, SectionTitle } from '../../../components/browse-ui';
import { colors } from '../../../components/theme';
import { useDatabase } from '../../../db/DatabaseGate';
import { getShopById, getShopInventory } from '../../../db/repository';
import { useDatabaseQuery } from '../../../hooks/useDatabaseQuery';

function parseShopId(value) {
  const rawValue = Array.isArray(value) ? value[0] : value;
  if (typeof rawValue !== 'string' || !/^\d+$/.test(rawValue)) {
    return null;
  }
  const shopId = Number(rawValue);
  return Number.isSafeInteger(shopId) && shopId > 0 ? shopId : null;
}

export default function ShopDetailsScreen() {
  const database = useDatabase();
  const { id } = useLocalSearchParams();
  const shopId = parseShopId(id);
  const [dialerError, setDialerError] = useState('');

  const loadShop = useCallback(async () => {
    if (shopId === null) {
      throw new Error('The shop ID is invalid.');
    }
    const shop = await getShopById(database, shopId);
    if (!shop) {
      return { shop: null, products: [] };
    }
    const products = await getShopInventory(database, shopId);
    return { shop, products };
  }, [database, shopId]);
  const { data, error, isLoading, retry } = useDatabaseQuery(loadShop);

  function backToShops() {
    router.dismissTo('/shops');
  }

  async function callShop() {
    if (!data?.shop?.phone) {
      return;
    }
    setDialerError('');
    const phoneUri = `tel:${data.shop.phone.replace(/[^\d+]/g, '')}`;
    try {
      await Linking.openURL(phoneUri);
    } catch {
      setDialerError('This device could not open a phone app for that number.');
    }
  }

  if (!isLoading && (error || data?.shop === null)) {
    return (
      <ScreenContainer>
        <QueryStatus
          isLoading={false}
          error={error || new Error('This shop could not be found.')}
          empty={false}
          onRetry={retry}
        />
        <AppButton label="Back to shops" secondary onPress={backToShops} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppButton label="‹  Back to shops" accessibilityLabel="Back to shops" secondary onPress={backToShops} style={styles.backButton} />
      {isLoading ? (
        <QueryStatus isLoading error={null} empty={false} onRetry={retry} />
      ) : (
        <>
          <ScreenTitle
            eyebrow={data.shop.district_name}
            title={data.shop.shop_name}
            subtitle="Shop details and equipment available here."
          />

          <View style={styles.detailsCard}>
            <Text style={styles.detailLabel}>Address</Text>
            <Text style={styles.detailValue}>{data.shop.address}</Text>
            <View style={styles.divider} />
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{data.shop.phone}</Text>
            <AppButton label="Call shop" onPress={callShop} style={styles.callButton} />
            {dialerError ? <Text accessibilityRole="alert" style={styles.dialerError}>{dialerError}</Text> : null}
          </View>

          <View>
            <SectionTitle title="Equipment at this shop" />
            {data.products.length > 0 ? data.products.map((product) => (
              <ProductCard key={product.product_id} product={product} />
            )) : (
              <QueryStatus
                isLoading={false}
                error={null}
                empty
                emptyTitle="No equipment listed yet"
                emptyMessage="Check back later for this shop’s inventory."
              />
            )}
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',
  },
  detailsCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  detailValue: {
    color: colors.ink,
    fontSize: 16,
    lineHeight: 23,
    marginTop: 5,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: 16,
  },
  callButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    minWidth: 150,
  },
  dialerError: {
    color: colors.danger,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },
});
