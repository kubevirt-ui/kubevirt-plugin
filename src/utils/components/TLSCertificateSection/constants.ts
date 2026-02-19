export const TLS_CERT_SOURCE_EXISTING = 'existing';
export const TLS_CERT_SOURCE_NEW = 'new';

export const TLS_CERT_CONFIGMAP_KEY = 'ca.pem';

export type TLSCertSourceType = typeof TLS_CERT_SOURCE_EXISTING | typeof TLS_CERT_SOURCE_NEW;
