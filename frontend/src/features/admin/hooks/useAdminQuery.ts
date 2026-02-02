import { useCallback, useEffect, useState } from "react";

export type UseAdminQueryOptions = {
  enabled?: boolean;
};

export type UseAdminQueryResult<T> = {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<T | null>;
};

export const useAdminQuery = <T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
  options: UseAdminQueryOptions = {}
): UseAdminQueryResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(options.enabled !== false);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetcher();
      setData(response);
      return response;
    } catch (caught) {
      const queryError = caught instanceof Error ? caught : new Error("Failed to load data");
      setError(queryError);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (options.enabled === false) {
      setIsLoading(false);
      return;
    }

    run();
  }, [options.enabled, run]);

  return {
    data,
    isLoading,
    error,
    refetch: run
  };
};
