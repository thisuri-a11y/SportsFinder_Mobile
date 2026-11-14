import { useCallback, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { FilterChip, ProductCard, QueryStatus, ScreenContainer, ScreenTitle, SearchField, SelectField } from '../../components/browse-ui';
import { StyleSheet, View } from 'react-native';
import { listDistricts, listProducts } from '../../db/repository';
import { useDatabase } from '../../db/DatabaseGate';
import { useDatabaseQuery } from '../../hooks/useDatabaseQuery';

const ALL_DISTRICTS = 'All districts';

function getParam(value) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default function FindScreen() {
  const database = useDatabase();
  const { district: districtParam } = useLocalSearchParams();
  const district = getParam(districtParam) || ALL_DISTRICTS;
  const [keyword, setKeyword] = useState('');
  const searchTerm = keyword.trim();
  const hasDistrict = district !== ALL_DISTRICTS;

  const loadFindResults = useCallback(async () => {
    const [districts, products] = await Promise.all([
      listDistricts(database),
      listProducts(database, {
        districtName: hasDistrict ? district : undefined,
        search: searchTerm,
      }),
    ]);
    return { districts, products };
  }, [database, district, hasDistrict, searchTerm]);
  const { data, error, isLoading, retry } = useDatabaseQuery(loadFindResults);
  const districtOptions = [ALL_DISTRICTS, ...(data?.districts.map((item) => item.name) ?? [])];

  function selectDistrict(value) {
    router.setParams({ district: value === ALL_DISTRICTS ? '' : value });
  }

  function openShop(shopId) {
    router.push({ pathname: '/shops/[id]', params: { id: String(shopId) } });
  }

  const empty = Boolean(data && data.products.length === 0);

  return (
    <ScreenContainer>
      <ScreenTitle
        eyebrow="FIND GEAR"
        title="What are you looking for?"
        subtitle="Search equipment, brands, sports, or shops, then narrow by district."
      />

      <SearchField
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Try football, Yonex, or a shop name"
        accessibilityLabel="Search equipment, brand, sport, or shop"
      />

      <SelectField
        label="District"
        value={district}
        options={districtOptions.includes(district) ? districtOptions : [ALL_DISTRICTS, district, ...districtOptions.slice(1)]}
        onChange={selectDistrict}
      />

      {(searchTerm || hasDistrict) ? (
        <View style={styles.activeFilters}>
          {searchTerm ? (
            <FilterChip
              label={`${searchTerm.length > 30 ? searchTerm.slice(0, 30) + '…' : searchTerm} ×`}
              accessibilityLabel="Remove keyword filter"
              selected
              onPress={() => setKeyword('')}
            />
          ) : null}
          {hasDistrict && (
            <FilterChip label={`${district} ×`} accessibilityLabel={`Remove district filter: ${district}`} selected onPress={() => selectDistrict(ALL_DISTRICTS)} />
          )}
          <FilterChip label="Clear all" accessibilityLabel="Clear all filters" onPress={() => {
            setKeyword('');
            selectDistrict(ALL_DISTRICTS);
          }} />
        </View>
      ) : null}

      <ScreenTitle
        title={data ? `${data.products.length} ${data.products.length === 1 ? 'result' : 'results'}` : 'Results'}
        subtitle={district === ALL_DISTRICTS ? 'Across all districts' : `In ${district}`}
      />

      <QueryStatus
        isLoading={isLoading}
        error={error}
        empty={empty}
        emptyTitle="No matching gear found"
        emptyMessage={searchTerm
          ? `No results for “${searchTerm}”. Try another keyword or district.`
          : 'Try another district or clear your filters.'}
        onRetry={retry}
      />

      {data?.products.map((product) => (
        <ProductCard
          key={product.product_id}
          product={product}
          onShopPress={() => openShop(product.shop_id)}
        />
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
