import {
  ClusterRoleBindingModel,
  RoleBindingModel,
  RoleModel,
  ServiceAccountModel,
} from '@kubevirt-ui-ext/kubevirt-api/console';
import { type IoK8sApiRbacV1ClusterRoleBinding } from '@kubevirt-ui-ext/kubevirt-api/kubernetes';
import { isConflictError } from '@kubevirt-utils/errors/errorTypes';
import { isEmpty } from '@kubevirt-utils/utils/utils';
import { kubevirtK8sCreate, kubevirtK8sGet, kubevirtK8sPatch } from '@multicluster/k8sRequests';

import { STORAGE_CHECKUP_SA, STORAGE_CLUSTER_ROLE_BINDING } from './consts';
import {
  serviceAccountResource,
  storageCheckupRole,
  storageCheckupRoleBinding,
  storageClusterRoleBinding,
} from './storageResources';

const ignoreConflict = async (request: Promise<unknown>): Promise<void> => {
  try {
    await request;
  } catch (error) {
    if (!isConflictError(error)) throw error;
  }
};

/** Create the Role, or replace its rules when it already exists (outdated installs). */
const createOrUpdateStorageCheckupRole = async (
  namespace: string,
  cluster: string,
): Promise<void> => {
  const role = storageCheckupRole(namespace);
  try {
    await kubevirtK8sCreate({ cluster, data: role, model: RoleModel });
  } catch (error) {
    if (!isConflictError(error)) throw error;
    await kubevirtK8sPatch({
      cluster,
      data: [{ op: 'replace', path: '/rules', value: role.rules }],
      model: RoleModel,
      resource: role,
    });
  }
};

const createStorageClusterRoleBinding = async (
  namespace: string,
  cluster: string,
): Promise<IoK8sApiRbacV1ClusterRoleBinding | undefined> => {
  try {
    await kubevirtK8sCreate({
      cluster,
      data: storageClusterRoleBinding(namespace),
      model: ClusterRoleBindingModel,
    });
    return undefined;
  } catch (error) {
    if (!isConflictError(error)) throw error;
    // Created concurrently (e.g. from another namespace): fall through and add our subject.
    return kubevirtK8sGet<IoK8sApiRbacV1ClusterRoleBinding>({
      cluster,
      model: ClusterRoleBindingModel,
      name: STORAGE_CLUSTER_ROLE_BINDING,
    });
  }
};

/** Ensure the namespace SA is a subject of the shared cluster-reader ClusterRoleBinding. */
const ensureStorageClusterRoleBindingSubject = async (
  namespace: string,
  cluster: string,
  existingCRB?: IoK8sApiRbacV1ClusterRoleBinding,
): Promise<void> => {
  const subject = { kind: 'ServiceAccount', name: STORAGE_CHECKUP_SA, namespace };
  const crb = existingCRB ?? (await createStorageClusterRoleBinding(namespace, cluster));
  if (!crb) return;

  const alreadyBound = crb.subjects?.some(
    (existing) =>
      existing?.kind === subject.kind &&
      existing?.name === subject.name &&
      existing?.namespace === namespace,
  );
  if (alreadyBound) return;

  await kubevirtK8sPatch({
    cluster,
    data: isEmpty(crb.subjects)
      ? [{ op: 'add', path: '/subjects', value: [subject] }]
      : [{ op: 'add', path: '/subjects/-', value: subject }],
    model: ClusterRoleBindingModel,
    resource: crb,
  });
};

/** Idempotent install: safe to run on fresh, partial, or outdated installations. */
export const installStorageCheckupPermissions = async (
  namespace: string,
  cluster: string,
  existingCRB?: IoK8sApiRbacV1ClusterRoleBinding,
): Promise<void> => {
  await Promise.all([
    ignoreConflict(
      kubevirtK8sCreate({
        cluster,
        data: serviceAccountResource(namespace),
        model: ServiceAccountModel,
      }),
    ),
    createOrUpdateStorageCheckupRole(namespace, cluster),
  ]);
  await ignoreConflict(
    kubevirtK8sCreate({
      cluster,
      data: storageCheckupRoleBinding(namespace),
      model: RoleBindingModel,
    }),
  );
  await ensureStorageClusterRoleBindingSubject(namespace, cluster, existingCRB);
};
