import { useKubevirtClusterServiceVersion } from './useKubevirtClusterServiceVersion';

const useRelatedImage = ({
  cluster,
  fallback,
  name,
}: {
  cluster?: string;
  fallback: string;
  name: string;
}): [string | undefined, boolean, Error, boolean] => {
  const { installedCSV, loaded, loadErrors } = useKubevirtClusterServiceVersion(cluster);
  if (!loaded || loadErrors) {
    return [undefined, loaded, loadErrors, false];
  }

  const bundledImage = installedCSV?.spec?.relatedImages?.find((relatedImage) =>
    relatedImage?.name?.includes(name),
  )?.image;

  const isFallback = bundledImage === undefined;

  return [bundledImage ?? fallback, loaded, loadErrors, isFallback];
};

export default useRelatedImage;
