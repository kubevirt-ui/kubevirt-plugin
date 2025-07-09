import { useParams } from 'react-router-dom-v5-compat';

const useClusterParam = () => {
  const { cluster } = useParams<{ cluster?: string }>();

  return cluster;
};

export default useClusterParam;
