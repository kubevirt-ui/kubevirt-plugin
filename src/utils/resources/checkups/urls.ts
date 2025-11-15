export const getNetworkCheckupURL = (name: string, namespace: string, cluster?: string) => {
  return cluster
    ? `/k8s/cluster/${cluster}/ns/${namespace}/checkups/${name}`
    : `/k8s/ns/${namespace}/checkups/network/${name}`;
};

export const getStorageCheckupURL = (name: string, namespace: string, cluster?: string) => {
  return cluster
    ? `/k8s/cluster/${cluster}/ns/${namespace}/checkups/storage/${name}`
    : `/k8s/ns/${namespace}/checkups/storage/${name}`;
};
