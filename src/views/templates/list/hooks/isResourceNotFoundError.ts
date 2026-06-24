type K8sResourceLoadError = {
  code?: number;
  response?: { status?: number };
};

const isResourceNotFoundError = (error: unknown): boolean => {
  const loadError = error as K8sResourceLoadError;
  return loadError?.code === 404 || loadError?.response?.status === 404;
};

export default isResourceNotFoundError;
