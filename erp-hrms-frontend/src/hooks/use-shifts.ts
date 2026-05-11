import { useState, useEffect, useCallback } from 'react';
import { attendanceService } from '../services/api';

export function useShifts() {
  const [shifts, setShifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await attendanceService.getShifts();
      setShifts(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
      setError('Failed to fetch shifts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  return {
    shifts,
    isLoading,
    error,
    refresh: fetchShifts
  };
}
