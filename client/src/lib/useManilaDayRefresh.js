import { useEffect } from 'react';
import { observeManilaDay } from './manilaDay';

export function useManilaDayRefresh(onDayChange) {
  useEffect(() => observeManilaDay(onDayChange), [onDayChange]);
}
