import { useCallback, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { AppButton, FilterChip, FilterChipRow, ProductCard, QueryStatus, ScreenContainer, ScreenTitle, SearchField, SelectField } from '../../components/browse-ui';
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

  const loadFindResults = useCallback(async () => {
    const [districts, products] = await Promise.all([
      listDistricts(database),
      listProducts(database, {
        districtName: district === ALL_DISTRICTS ? undefined : district,
        search: keyword,
      }),
    ]);
    return { districts, products };
  }, [database, district, keyword]);
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

      <FilterChipRow>
        <FilterChip
          label={ALL_DISTRICTS}
          selected={district === ALL_DISTRICTS}
          onPress={() => selectDistrict(ALL_DISTRICTS)}
        />
        {data?.districts.slice(0, 5).map((item) => (
          <FilterChip
            key={item.id}
            label={item.name}
            selected={district === item.name}
            onPress={() => selectDistrict(item.name)}
          />
        ))}
      </FilterChipRow>

      <ScreenTitle
        title={data ? `${data.products.length} ${data.products.length === 1 ? 'result' : 'results'}` : 'Results'}
        subtitle={district === ALL_DISTRICTS ? 'Across all districts' : `In ${district}`}
      />

      <QueryStatus
        isLoading={isLoading}
        error={error}
        empty={empty}
        emptyTitle="No matching gear found"
        emptyMessage={keyword.trim()
          ? `No results for “${keyword.trim()}”. Try another keyword or district.`
          : 'Try another district or clear your filters.'}
        onRetry={retry}
      />

      {data && !error && data.products.length > 0 ? (
        <>
          {data.products.map((product) => (
            <ProductCard
              key={product.product_id}
              product={product}
              onShopPress={() => openShop(product.shop_id)}
            />
          ))}
          <AppButton label="Clear keyword" secondary onPress={() => setKeyword('')} />
        </>
      ) : null}
    </ScreenContainer>
  );
}
