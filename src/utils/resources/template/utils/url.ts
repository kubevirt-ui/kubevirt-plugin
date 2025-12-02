export const getTemplateURL = (name: string, namespace: string, cluster?: string): string =>
  cluster
    ? `/k8s/cluster/${cluster}/ns/${namespace}/templates/${name}`
    : `/k8s/ns/${namespace}/templates/${name}`;

export const getTemplateListURL = (namespace?: string): string =>
  namespace ? `/k8s/ns/${namespace}/templates` : `/k8s/all-namespaces/templates`;

export const getACMTemplateListURL = (): string => `/k8s/all-clusters/all-namespaces/templates`;
