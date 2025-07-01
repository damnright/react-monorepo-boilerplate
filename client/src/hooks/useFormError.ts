import React from 'react';

/**
 * 表单错误处理hook
 */
export function useFormError() {
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((err: any) => {
    const message = err?.response?.data?.message || err?.message || '操作失败';
    setError(message);
  }, []);

  const executeAsync = React.useCallback(async <T>(
    asyncFn: () => Promise<T>,
    onSuccess?: (result: T) => void
  ): Promise<T | undefined> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await asyncFn();
      onSuccess?.(result);
      return result;
    } catch (err) {
      handleError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  return {
    error,
    isLoading,
    clearError,
    handleError,
    executeAsync,
    setIsLoading,
  };
} 