import { useCallback, useEffect, useState } from 'react';
import { subscribeToDatabaseRefresh } from './databaseRefresh';

export function useDatabaseQuery(loadData) {
  const [requestId, setRequestId] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    return subscribeToDatabaseRefresh(() => {
      setRequestId((current) => current + 1);
    });
  }, []);

  useEffect(() => {
    let active = true;

    Promise.resolve()
      .then(loadData)
      .then((data) => {
        if (active) {
          setResult({ requestId, loadData, data, error: null });
        }
      })
      .catch((error) => {
        if (active) {
          setResult({ requestId, loadData, data: null, error });
        }
      });

    return () => {
      active = false;
    };
  }, [loadData, requestId]);

  const retry = useCallback(() => {
    setRequestId((current) => current + 1);
  }, []);

  const isCurrentResult = result?.requestId === requestId && result?.loadData === loadData;

  return {
    data: isCurrentResult ? result.data : null,
    error: isCurrentResult ? result.error : null,
    isLoading: !isCurrentResult,
    retry,
  };
}
