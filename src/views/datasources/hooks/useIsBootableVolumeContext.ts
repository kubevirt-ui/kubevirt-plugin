import { useSearchParams } from 'react-router';

const FROM_QUERY_PARAM = 'from';
export const BOOTABLE_VOLUMES_CONTEXT_PARAM = 'bootablevolumes';

export const appendBootableVolumeContext = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}${FROM_QUERY_PARAM}=${BOOTABLE_VOLUMES_CONTEXT_PARAM}`;
};

const useIsBootableVolumeContext = (): boolean => {
  const [searchParams] = useSearchParams();
  return searchParams.get(FROM_QUERY_PARAM) === BOOTABLE_VOLUMES_CONTEXT_PARAM;
};

export default useIsBootableVolumeContext;
