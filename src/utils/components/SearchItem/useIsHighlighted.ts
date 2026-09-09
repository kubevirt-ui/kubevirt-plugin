import { useLocation } from 'react-router';

export const idIsHighlighted = (id: string, hash: string): boolean => {
  return hash?.toLowerCase().endsWith(id?.toLowerCase());
};

export const useIsHighlighted = (id: string): boolean => {
  const location = useLocation();

  return idIsHighlighted(id, location?.hash);
};
