import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { FilterChip, FilterChipRow, ProductCard, QueryStatus, ScreenContainer, ScreenTitle, SearchField, SelectField } from '../../components/browse-ui';
import { colors } from '../../components/theme';
import { useDatabase } from '../../db/DatabaseGate';
import { listCategories, listProducts } from '../../db/repository';
import { useDatabaseQuery } from '../../hooks/useDatabaseQuery';

const ALL_SPORTS = 'All sports';

function getParam(value) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default function CatalogueScreen() {
  const database = useDatabase();
  const { category: categoryParam } = useLocalSearchParams();
  const category = getParam(categoryParam) || ALL_SPORTS;
  const [keyword, setKeyword] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);

  const loadCatalogue = useCallback(async () => {
    const [categories, products] = await Promise.all([
      listCategories(database),
      listProducts(database, {
        category: category === ALL_SPORTS ? undefined : category,
        search: keyword,
        available: inStockOnly ? 1 : undefined,
      }),
    ]);
    return { categories, products };
  }, [category, database, inStockOnly, keyword]);
  const { data, error, isLoading, retry } = useDatabaseQuery(loadCatalogue);
  const categoryOptions = [ALL_SPORTS, ...(data?.categories ?? [])];

  function selectCategory(value) {
    router.setParams({ category: value === ALL_SPORTS ? '' : value });
  }

  function openShop(shopId) {
    router.push({ pathname: '/shops/[id]', params: { id: String(shopId) } });
  }

  const empty = Boolean(data && data.products.length === 0);

  return (
    <ScreenContainer>
      <ScreenTitle
        eyebrow="CATALOGUE"
        title="Browse equipment"
        subtitle="Explore every product, compare prices, and check what is in stock."
      />

      <SearchField
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Search product, brand, sport, or shop"
        accessibilityLabel="Search the catalogue"
      />

      <SelectField
        label="Sport"
        value={category}
        options={categoryOptions.includes(category) ? categoryOptions : [ALL_SPORTS, category, ...categoryOptions.slice(1)]}
        onChange={selectCategory}
      />

      <FilterChipRow>
        <FilterChip
          label={ALL_SPORTS}
          selected={category === ALL_SPORTS}
          onPress={() => selectCategory(ALL_SPORTS)}
        />
        {data?.categories.map((sport) => (
          <FilterChip
            key={sport}
            label={sport}
            selected={category === sport}
            onPress={() => selectCategory(sport)}
          />
        ))}
      </FilterChipRow>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="In stock only"
        accessibilityState={{ selected: inStockOnly }}
        onPress={() => setInStockOnly((current) => !current)}
        style={({ pressed }) => [styles.stockToggle, pressed && styles.pressed]}
      >
        <View style={[styles.checkBox, inStockOnly && styles.checkBoxSelected]}>
          {inStockOnly ? <Text style={styles.checkMark}>✓</Text> : null}
        </View>
        <Text style={styles.stockToggleText}>In stock only</Text>
      </Pressable>

      <ScreenTitle
        title={data ? `${data.products.length} ${data.products.length === 1 ? 'item' : 'items'}` : 'Products'}
        subtitle={inStockOnly ? 'Showing available items only' : 'All stock statuses'}
      />

      <QueryStatus
        isLoading={isLoading}
        error={error}
        empty={empty}
        emptyTitle="No equipment matches these filters"
        emptyMessage="Try another sport, search term, or stock setting."
        onRetry={retry}
      />

      {data && !error ? data.products.map((product) => (
        <ProductCard
          key={product.product_id}
          product={product}
          onShopPress={() => openShop(product.shop_id)}
        />
      )) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  stockToggle: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 11,
    minHeight: 48,
    paddingHorizontal: 4,
  },
  checkBox: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkBoxSelected: {
    backgroundColor: colors.forest,
    borderColor: colors.forest,
  },
  checkMark: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: '800',
  },
  stockToggleText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
