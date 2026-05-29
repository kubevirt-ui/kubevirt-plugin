import { V1beta1Plan } from '@kubev2v/types';

export const getSourceProviderName = (plan: V1beta1Plan) => plan?.spec?.provider?.source?.name;

export const getTargetProviderName = (plan: V1beta1Plan) => plan?.spec?.provider?.destination?.name;
export const getTargetProviderUID = (plan: V1beta1Plan) => plan?.spec?.provider?.destination?.uid;

export const getTargetNamespace = (plan: V1beta1Plan) => plan?.spec?.targetNamespace;
