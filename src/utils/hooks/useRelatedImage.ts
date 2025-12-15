import { useKubevirtClusterServiceVersion } from './useKubevirtClusterServiceVersion';

const useRelatedImage = ({
  cluster,
  fallback,
  name,
}: {
  cluster?: string;
  fallback: string;
  name: string;
}): [string | undefined, boolean, Error] => {
  const { installedCSV, loaded, loadErrors } = useKubevirtClusterServiceVersion(cluster);
  if (!loaded || loadErrors) {
    return [undefined, loaded, loadErrors];
  }

  const bundledImage = installedCSV?.spec?.relatedImages?.find((relatedImage) =>
    relatedImage?.name?.includes(name),
  )?.image;

  return [bundledImage ?? fallback, loaded, loadErrors];
};

export default useRelatedImage;
