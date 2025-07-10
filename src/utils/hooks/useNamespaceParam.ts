import { useParams } from 'react-router-dom-v5-compat';

const useNamespaceParam = () => {
  const { ns: namespace } = useParams<{ ns?: string }>();
  return namespace;
};

export default useNamespaceParam;
