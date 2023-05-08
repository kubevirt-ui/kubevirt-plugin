const isMultiClusterEnabled = (): boolean => (window as any).SERVER_FLAGS.clusters?.length > 1;
// enable when more than one cluster is present in the list

export default isMultiClusterEnabled;
