import { useCallback, useState } from "react";

export type MutationLifecycleContext<TContext> = {
  rollback?: () => void;
  context?: TContext;
};

export type UseAdminMutationOptions<TInput, TResult, TContext = unknown> = {
  onMutate?: (input: TInput) => MutationLifecycleContext<TContext> | void;
  onSuccess?: (result: TResult, input: TInput, context?: TContext) => void;
  onError?: (error: Error, input: TInput, context?: TContext) => void;
  onSettled?: (result: TResult | null, error: Error | null, input: TInput, context?: TContext) => void;
};

export type UseAdminMutationResult<TInput, TResult> = {
  mutate: (input: TInput) => Promise<TResult>;
  isLoading: boolean;
  error: Error | null;
};

export const useAdminMutation = <TInput, TResult, TContext = unknown>(
  mutateFn: (input: TInput) => Promise<TResult>,
  options: UseAdminMutationOptions<TInput, TResult, TContext> = {}
): UseAdminMutationResult<TInput, TResult> => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(
    async (input: TInput) => {
      setIsLoading(true);
      setError(null);

      const optimistic = options.onMutate?.(input);

      try {
        const result = await mutateFn(input);
        options.onSuccess?.(result, input, optimistic?.context);
        options.onSettled?.(result, null, input, optimistic?.context);
        return result;
      } catch (caught) {
        const mutationError = caught instanceof Error ? caught : new Error("Admin action failed");
        optimistic?.rollback?.();
        setError(mutationError);
        options.onError?.(mutationError, input, optimistic?.context);
        options.onSettled?.(null, mutationError, input, optimistic?.context);
        throw mutationError;
      } finally {
        setIsLoading(false);
      }
    },
    [mutateFn, options]
  );

  return {
    mutate,
    isLoading,
    error
  };
};
