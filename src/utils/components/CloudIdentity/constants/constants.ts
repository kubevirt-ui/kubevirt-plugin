export const AWS_ROLE_ARN_ANNOTATION = 'eks.amazonaws.com/role-arn';

export const CLOUD_IDENTITY_PROVIDERS = ['aws'] as const;
export const CLOUD_IDENTITY_PROVIDER_LABELS = {
  aws: 'AWS / ROSA',
} as const satisfies Record<(typeof CLOUD_IDENTITY_PROVIDERS)[number], string>;
export const CLOUD_IDENTITY_SERVICE_ACCOUNT_SOURCES = ['existing', 'new'] as const;

export const DEFAULT_SERVICE_ACCOUNT_NAME = 'default';
