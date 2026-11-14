import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { QueryStatus, ScreenContainer, ScreenTitle, SearchField, ShopCard } from '../../../components/browse-ui';
import { useDatabase } from '../../../db/DatabaseGate';
import { searchShops } from '../../../db/repository';
import { useDatabaseQuery } from '../../../hooks/useDatabaseQuery';

export default function ShopsScreen() {
  const database = useDatabase();
  const [search, setSearch] = useState('');
  const loadShops = useCallback(() => searchShops(database, search), [database, search]);
  const { data: shops, error, isLoading, retry } = useDatabaseQuery(loadShops);
  const empty = Boolean(shops && shops.length === 0);

  return (
    <ScreenContainer>
      <ScreenTitle
        eyebrow="SHOP DIRECTORY"
        title="Find a local sports shop"
        subtitle="Search by shop name, district, or street address."
      />
      <SearchField
        value={search}
        onChangeText={setSearch}
        placeholder="Search shops, districts, or addresses"
        accessibilityLabel="Search shops by name, district, or address"
      />
      <QueryStatus
        isLoading={isLoading}
        error={error}
        empty={empty}
        emptyTitle="No shops match that search"
        emptyMessage="Try a different shop name, district, or address."
        onRetry={retry}
      />
      {shops && !error ? shops.map((shop) => (
        <ShopCard
          key={shop.shop_id}
          shop={shop}
          onPress={() => router.push({ pathname: '/shops/[id]', params: { id: String(shop.shop_id) } })}
        />
      )) : null}
    </ScreenContainer>
  );
}
