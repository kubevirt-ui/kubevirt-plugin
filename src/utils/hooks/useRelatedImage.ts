import { useKubevirtClusterServiceVersion } from './useKubevirtClusterServiceVersion';

const useRelatedImage = ({ fallback, name }): [string | undefined, boolean, Error] => {
  const { installedCSV, loaded, loadErrors } = useKubevirtClusterServiceVersion();
  if (!loaded || loadErrors) {
    return [undefined, loaded, loadErrors];
  }

  const bundledImage = installedCSV?.spec?.relatedImages?.find((relatedImage) =>
    relatedImage?.name?.includes(name),
  )?.image;

  return [bundledImage ?? fallback, loaded, loadErrors];
};

export default useRelatedImage;
