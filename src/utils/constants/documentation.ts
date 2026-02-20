import pluginMetadata from '../../../plugin-metadata';

export const PLUGIN_VERSION = pluginMetadata.version;

const REDHAT_BASE_URL = 'https://www.redhat.com';
const RH_ACCESS_URL = 'https://access.redhat.com';
const K8_DOC_OBJ_URL = 'https://kubernetes.io/docs/concepts/overview/working-with-objects';
const K8S_PERSISTENT_VOLUMES_URL =
  'https://kubernetes.io/docs/concepts/storage/persistent-volumes/';
const KV_UG_URL = 'https://kubevirt.io';
const RH_DOC_URL = 'https://docs.redhat.com/documentation';
const REDHAT_DOC_URL = `${RH_DOC_URL}/openshift_container_platform/latest`;
const RHACM_DOC_URL = `${RH_DOC_URL}/red_hat_advanced_cluster_management_for_kubernetes`;

export const documentationURL = {
  AAQ_OPERATOR: `${REDHAT_DOC_URL}/html-single/virtualization/index#virt-about-aaq-operator_virt-understanding-aaq-operator`,
  ACCESS_MODE: `${K8S_PERSISTENT_VOLUMES_URL}/#access-modes`,
  ANNOTATIONS: `${K8_DOC_OBJ_URL}/annotations/`,
  AUTOCOMPUTE_CPU_LIMITS: `${KV_UG_URL}/user-guide/virtual_machines/resources_requests_and_limits/`,
  CDI_UPLOAD_SUPPORTED_TYPES: `${REDHAT_DOC_URL}/html/virtualization/storage#virt-cdi-supported-operations-matrix_virt-preparing-cdi-scratch-space`,
  CHECKUPS: `${REDHAT_DOC_URL}/html/virtualization/monitoring#virt-running-cluster-checkups`,
  CLOUDINIT_INFO: 'https://cloudinit.readthedocs.io/en/latest/index.html',
  CREATING_VMS_FROM_TEMPLATES: `${REDHAT_DOC_URL}/html/virtualization/creating-a-virtual-machine#virt-creating-vms-from-templates`,
  CRON_INFO: `${REDHAT_BASE_URL}/sysadmin/automate-linux-tasks-cron`,
  DATA_FOUNDATION_OPERATOR: `${RH_DOC_URL}/red_hat_openshift_data_foundation/latest/html-single/red_hat_openshift_data_foundation_architecture/index`,
  DATAVOLUME_PREALLOCATIONS: `${REDHAT_DOC_URL}/html/virtualization/storage#virt-using-preallocation-for-datavolumes`,
  DECLARATIVE_HOTPLUG_VOLUMES: `${KV_UG_URL}/user-guide/storage/hotplug_volumes/#enabling-hotplug-volume-support`,
  DESCHEDULER: `${KV_UG_URL}/user-guide/operations/node_assignment/#node-balancing-with-descheduler`,
  DEV_PREVIEW: `${RH_ACCESS_URL}/support/offerings/devpreview`,
  DYNAMIC_SSH_KEY_INJECTION: `${REDHAT_DOC_URL}/html/virtualization/managing-vms#virt-accessing-vm-ssh`,
  FREE_PAGE_REPORTING:
    'https://developers.redhat.com/articles/2024/03/13/save-memory-openshift-virtualization-using-free-page-reporting',
  HIGHLIGHTS: `${REDHAT_DOC_URL}#What's%20New`,
  HUGEPAGES: `${RH_DOC_URL}/openshift_container_platform/4.19/html/scalability_and_performance/what-huge-pages-do-and-how-they-are-consumed`,
  INSTANCE_TYPES_USER_GUIDE: `${KV_UG_URL}/user-guide/virtual_machines/instancetypes#virtualmachinepreference`,
  LABELS: `${K8_DOC_OBJ_URL}/labels/`,
  METADATA:
    'https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata',
  MIGRATION_CONFIGURATION: `${KV_UG_URL}/api-reference/main/definitions.html#_v1_migrationconfiguration`,
  MIGRATION_POLICIES: `${REDHAT_DOC_URL}/html/virtualization/live-migration#live-migration-policies`,
  MTV_OPERATOR: `${RH_DOC_URL}/migration_toolkit_for_virtualization/latest/html/installing_and_using_the_migration_toolkit_for_virtualization/index`,
  NAME: `${K8_DOC_OBJ_URL}/names`,
  NAMESPACE_DOC: `${K8_DOC_OBJ_URL}/namespaces/`,
  NETWORKING: `${REDHAT_DOC_URL}/html/virtualization/networking`,
  NMSTATE_OPERATOR: `${REDHAT_DOC_URL}/html-single/networking/index#k8s-nmstate-about-the-k8s-nmstate-operator`,
  NODEPORTS: `${REDHAT_DOC_URL}/html/networking/configuring-ingress-cluster-traffic#nw-using-nodeport_configuring-ingress-cluster-traffic-nodeport`,
  NON_VCPU_LINK: `${REDHAT_DOC_URL}/html/virtualization/monitoring#virt-querying-metrics_virt-prometheus-queries`,
  OPERATIONS: `${REDHAT_DOC_URL}/html/operators/index`,
  OS_IMAGE_CENTOS: 'https://cloud.centos.org/centos/',
  OS_IMAGE_FEDORA: 'https://alt.fedoraproject.org/cloud/',
  OS_IMAGE_OTHER: 'https://alt.fedoraproject.org/cloud/',
  OS_IMAGE_RHEL: `${RH_ACCESS_URL}/downloads/content/479`,
  OS_IMAGE_WINDOWS: 'https://www.microsoft.com/en-us/software-download/windows10ISO',
  PASST: `${KV_UG_URL}/user-guide/network/net_binding_plugins/passt/#vm-passt-network-interface`,
  PROJECTS: 'https://docs.okd.io/latest/applications/projects/working-with-projects.html',
  REDHAT_BLOG: `${REDHAT_BASE_URL}/blog/channel/red-hat-openshift`,
  RHACM: RHACM_DOC_URL,
  SNAPSHOT: `${REDHAT_DOC_URL}/html/storage/using-container-storage-interface-csi#persistent-storage-csi-snapshots`,
  STORAGE_PROFILES: `${REDHAT_DOC_URL}/html/virtualization/storage#virt-configuring-storage-profile`,
  SUPPORT_URL: `${RH_ACCESS_URL}/articles/4234591`,
  SYSPREP: `${KV_UG_URL}/user-guide/user_workloads/startup_scripts/#sysprep`,
  TAINTS_TOLERATION: `${REDHAT_DOC_URL}/html/virtualization/postinstallation-configuration#virt-node-placement-virt-components`,
  TECH_PREVIEW: `${RH_ACCESS_URL}/support/offerings/techpreview`,
  vCPU_LINK: `${REDHAT_DOC_URL}/html/virtualization/monitoring#virt-promql-vcpu-metrics_virt-prometheus-queries`,
  VIRT_MANAGER_DOWNLOAD: 'https://virt-manager.org/download.html',
  VIRT_SECONDARY_NETWORK: `${REDHAT_DOC_URL}/html/virtualization/networking#secondary-network-config`,
  VIRTCTL_CLI: `${REDHAT_DOC_URL}/html/virtualization/getting-started#virt-using-the-cli-tools`,
  VIRTUALIZATION_BLOG: `https://cloud.redhat.com/learn/topics/virtualization/`,
  VIRTUALIZATION_WHAT_YOU_CAN_DO: `${REDHAT_DOC_URL}/html/virtualization/about#virt-what-you-can-do-with-virt_about-virt`,
  VOLUME_MODE: `${K8S_PERSISTENT_VOLUMES_URL}/#volume-mode`,
};
