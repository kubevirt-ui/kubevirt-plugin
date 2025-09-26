import { useLocation } from 'react-router-dom-v5-compat';

export const idIsHighlighted = (id: string, hash: string) => {
  return hash?.toLowerCase().endsWith(id?.toLowerCase());
};

export const useIsHighlighted = (id: string) => {
  const location = useLocation();

  return idIsHighlighted(id, location?.hash);
};
