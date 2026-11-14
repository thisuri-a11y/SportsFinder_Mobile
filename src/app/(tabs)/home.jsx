import { useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../auth/AuthProvider';
import { AppButton, FilterChip, FilterChipRow, ProductCard, QueryStatus, ScreenContainer, ScreenTitle, SectionTitle, ShopCard } from '../../components/browse-ui';
import { SportsArt } from '../../components/SportsArt';
import { colors } from '../../components/theme';
import { useDatabase } from '../../db/DatabaseGate';
import { listCategories, listDistricts, listProducts, listShops } from '../../db/repository';
import { useDatabaseQuery } from '../../hooks/useDatabaseQuery';

const POPULAR_DISTRICTS = ['Colombo', 'Gampaha', 'Kandy', 'Galle'];

export default function HomeScreen() {
  const database = useDatabase();
  const { account, signOut } = useAuth();
  const loadHome = useCallback(async () => {
    const [shops, products, districts, categories] = await Promise.all([
      listShops(database),
      listProducts(database),
      listDistricts(database),
      listCategories(database),
    ]);
    return { shops, products, districts, categories };
  }, [database]);
  const { data, error, isLoading, retry } = useDatabaseQuery(loadHome);

  function openShop(shopId) {
    router.push({ pathname: '/shops/[id]', params: { id: String(shopId) } });
  }

  const popularDistricts = POPULAR_DISTRICTS.filter((name) =>
    data?.districts.some((district) => district.name === name),
  );
  const isEmpty = Boolean(data && data.shops.length === 0 && data.products.length === 0);

  return (
    <ScreenContainer>
      <ScreenTitle
        eyebrow="SPORTFINDER · SRI LANKA"
        title={`Hello, ${account?.username || 'there'}`}
        subtitle="Find the right gear at sports shops near you."
        right={<AppButton label="Sign out" secondary onPress={signOut} style={styles.signOut} />}
      />

      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <Text style={styles.heroTitle}>Get ready for your next game.</Text>
          <SportsArt variant="table-tennis" style={styles.heroArt} />
        </View>
        <Text style={styles.heroSubtitle}>
          Browse equipment by sport, district, or the name of the gear you need.
        </Text>
        <AppButton
          label="Find gear"
          secondary
          onPress={() => router.push('/find')}
          style={styles.heroButton}
        />
      </View>

      {isLoading || error || isEmpty ? (
        <QueryStatus
          isLoading={isLoading}
          error={error}
          empty={isEmpty}
          emptyTitle="No shops or equipment yet"
          emptyMessage="Try again to reload your local catalogue."
          onRetry={retry}
        />
      ) : null}

      {data && !error ? (
        <>
          <View>
            <SectionTitle title="Popular districts" />
            {popularDistricts.length > 0 ? (
              <FilterChipRow>
                {popularDistricts.map((district) => (
                  <FilterChip
                    key={district}
                    label={district}
                    onPress={() => router.push({ pathname: '/find', params: { district } })}
                  />
                ))}
              </FilterChipRow>
            ) : (
              <Text style={styles.helperText}>Districts will appear here when available.</Text>
            )}
          </View>

          <View>
            <SectionTitle title="Shop by sport" />
            {data.categories.length > 0 ? (
              <FilterChipRow>
                {data.categories.map((category) => (
                  <FilterChip
                    key={category}
                    label={category}
                    onPress={() => router.push({ pathname: '/catalogue', params: { category } })}
                  />
                ))}
              </FilterChipRow>
            ) : (
              <Text style={styles.helperText}>Sports will appear here when equipment is available.</Text>
            )}
          </View>

          <View>
            <SectionTitle
              title="Shops to explore"
              actionLabel="See all shops"
              onAction={() => router.push('/shops')}
            />
            <View style={styles.cardList}>
              {data.shops.slice(0, 3).map((shop) => (
                <ShopCard key={shop.shop_id} shop={shop} compact onPress={() => openShop(shop.shop_id)} />
              ))}
            </View>
          </View>

          <View>
            <SectionTitle
              title="Equipment picks"
              actionLabel="Browse all gear"
              onAction={() => router.push('/catalogue')}
            />
            <View style={styles.productGrid}>
              {data.products.slice(0, 4).map((product) => (
                <ProductCard
                  key={product.product_id}
                  product={product}
                  compact
                  onShopPress={() => openShop(product.shop_id)}
                />
              ))}
            </View>
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  signOut: {
    minWidth: 88,
  },
  hero: {
    alignItems: 'flex-start',
    backgroundColor: colors.forest,
    borderRadius: 24,
    gap: 12,
    padding: 20,
  },
  heroTop: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  heroArt: {
    marginVertical: -8,
  },
  heroTitle: {
    color: colors.surface,
    fontSize: 27,
    fontWeight: '800',
    lineHeight: 34,
    flexGrow: 1,
    flexBasis: 145,
    maxWidth: 375,
  },
  heroSubtitle: {
    color: '#E2EEE7',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 560,
  },
  heroButton: {
    backgroundColor: colors.amber,
    borderColor: colors.amber,
    minWidth: 140,
  },
  helperText: {
    color: colors.muted,
    fontSize: 14,
  },
  cardList: {
    gap: 10,
  },
  productGrid: {
    gap: 10,
  },
});
