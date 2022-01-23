export const KUBEADMIN_USERNAME = 'kubeadmin';
export const KUBEADMIN_IDP = 'kube:admin';

export const CLUSTER_NAMESPACE = 'openshift-storage';
export const STORAGE_SYSTEM_NAME = 'ocs-storagecluster-storagesystem';
export const STORAGE_CLUSTER_NAME = 'ocs-storagecluster';
export const CEPH_CLUSTER_NAME = `${STORAGE_CLUSTER_NAME}-cephcluster`;

/* OCS_SC_STATE is divided up into sub-strings for better readability
 * as OCS_SC_JSONPATH uses some escape sequences in order to fetch the
 * storage cluster's status.
 */
const CLUSTER_PHASE_QUERY = (name: string) => {
  return `{range .items[*]}{.metadata.name==${name}\"}{.status.phase}{\"\\n\"}{end}`;
};
const STORAGECLUSTER_PHASE = `"$(oc get storageclusters -n openshift-storage -o=jsonpath='${CLUSTER_PHASE_QUERY(
  STORAGE_CLUSTER_NAME,
)}')"`;
export const OCS_SC_STATE = `until [ ${STORAGECLUSTER_PHASE} = "Ready" ]; do sleep 1; done;`;

export enum CLUSTER_STATUS {
  READY = 'Ready',
  PROGRESSING = 'Progressing',
  HEALTH_ERROR = 'HEALTH_ERR',
}
