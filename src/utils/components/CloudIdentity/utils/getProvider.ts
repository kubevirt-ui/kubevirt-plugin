import { type CloudIdentityProvider } from '../types/types';

export const getProvider = (): CloudIdentityProvider | undefined => {
  const branding = window.SERVER_FLAGS.branding;

  if (branding === 'rosa') return 'aws';

  return undefined;
};
