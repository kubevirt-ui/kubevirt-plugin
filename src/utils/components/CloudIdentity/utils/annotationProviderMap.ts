import { AWS_ROLE_ARN_ANNOTATION } from '../constants/constants';
import { type CloudIdentityFormValues, type CloudIdentityProvider } from '../types/types';

type AnnotationProviderParams = Pick<CloudIdentityFormValues, 'awsRoleArn'>;

type AnnotationProviderConfig = {
  buildAnnotations: (params: AnnotationProviderParams) => Record<string, string>;
  identityAnnotation: string;
};

export const annotationProviderMap: Record<CloudIdentityProvider, AnnotationProviderConfig> = {
  aws: {
    buildAnnotations: ({ awsRoleArn }) => ({
      [AWS_ROLE_ARN_ANNOTATION]: awsRoleArn,
    }),
    identityAnnotation: AWS_ROLE_ARN_ANNOTATION,
  },
};
