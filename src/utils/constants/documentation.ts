export const REDHAT_BASE_URL = 'https://www.redhat.com';
export const REDHAT_DOC_URL = 'https://access.redhat.com/documentation/en-us';
export const OPENSHIFT_DOC_URL = 'https://docs.openshift.com/container-platform';

export const documentationURL = {
  ANNOTATIONS: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/annotations/',
  AUTOCOMPUTE_CPU_LIMITS:
    'https://kubevirt.io/user-guide/virtual_machines/resources_requests_and_limits/',
  CDI_UPLOAD_SUPPORTED_TYPES: `${REDHAT_DOC_URL}/openshift_container_platform/4.9/html/virtualization/virtual-machines#virt-cdi-supported-operations-matrix_virt-importing-virtual-machine-images-datavolumes`,
  CHECKUPS: `${OPENSHIFT_DOC_URL}/4.16/virt/monitoring/virt-running-cluster-checkups.html`,
  CHECKUPS_LATENCY: `${OPENSHIFT_DOC_URL}/4.15/virt/monitoring/virt-running-cluster-checkups.html#virt-measuring-latency-vm-secondary-network_virt-running-cluster-checkups`,

  CLOUDINIT_INFO: 'https://cloudinit.readthedocs.io/en/latest/index.html',
  CREATING_VMS_FROM_TEMPLATES: `${OPENSHIFT_DOC_URL}/4.15/virt/virtual_machines/creating_vms_rh/virt-creating-vms-from-templates.html`,
  CRON_INFO: `${REDHAT_BASE_URL}/sysadmin/automate-linux-tasks-cron`,
  DATA_FOUNDATION_OPERATOR:
    'https://access.redhat.com/documentation/en-us/red_hat_openshift_data_foundation/4.14/html-single/red_hat_openshift_data_foundation_architecture/index',
  DATAVOLUME_PREALLOCATIONS: `${OPENSHIFT_DOC_URL}/4.15/virt/storage/virt-using-preallocation-for-datavolumes.html`,
  DESCHEDULER:
    'https://kubevirt.io/user-guide/operations/node_assignment/#node-balancing-with-descheduler',
  DEV_PREVIEW: 'https://access.redhat.com/support/offerings/devpreview',
  DYNAMIC_SSH_KEY_INJECTION: `${OPENSHIFT_DOC_URL}/4.15/virt/virtual_machines/virt-accessing-vm-ssh.html`,
  FREE_PAGE_REPORTING:
    'https://developers.redhat.com/articles/2024/03/13/save-memory-openshift-virtualization-using-free-page-reporting',
  HIGHLIGHTS_417:
    'https://docs.openshift.com/container-platform/4.17/virt/release_notes/virt-4-17-release-notes.html#virt-4-17-new',
  INSTANCE_TYPES_USER_GUIDE:
    'https://kubevirt.io/user-guide/virtual_machines/instancetypes#virtualmachinepreference',
  LABELS: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/',
  METADATA:
    'https://git.k8s.io/community/contributors/devel/sig-architecture/api-conventions.md#metadata',
  MIGRATION_CONFIGURATION:
    'http://kubevirt.io/api-reference/main/definitions.html#_v1_migrationconfiguration',
  MIGRATION_POLICIES:
    'https://access.redhat.com/documentation/en-us/openshift_container_platform/4.15/html/virtualization/live-migration#live-migration-policies',
  MTV_OPERATOR:
    'https://access.redhat.com/documentation/en-us/migration_toolkit_for_virtualization/2.5/html/installing_and_using_the_migration_toolkit_for_virtualization/index',
  NAME: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/name',
  NAMESPACE_DOC: 'https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/',
  NMSTATE_OPERATOR:
    'https://docs.openshift.com/container-platform/4.14/networking/k8s_nmstate/k8s-nmstate-about-the-k8s-nmstate-operator.html',
  NODEPORTS: `${REDHAT_DOC_URL}/openshift_container_platform/4.14/html/networking/configuring-ingress-cluster-traffic#nw-using-nodeport_configuring-ingress-cluster-traffic-nodeport`,
  OPERATIONS: 'https://docs.openshift.com/container-platform/4.16/operators/index.html',
  OS_IMAGE_CENTOS: 'https://cloud.centos.org/centos/',
  OS_IMAGE_FEDORA: 'https://alt.fedoraproject.org/cloud/',
  OS_IMAGE_OTHER: 'https://alt.fedoraproject.org/cloud/',
  OS_IMAGE_RHEL: 'https://access.redhat.com/downloads/content/479/ver=/rhel---8/',
  OS_IMAGE_WINDOWS: 'https://www.microsoft.com/en-us/software-download/windows10ISO',
  PROJECTS: 'https://docs.okd.io/latest/applications/projects/working-with-projects.html',
  REDHAT_BLOG: `${REDHAT_BASE_URL}/en/blog/channel/red-hat-openshift`,
  SNAPSHOT: `${REDHAT_DOC_URL}/openshift_container_platform/4.10/html/storage/using-container-storage-interface-csi#persistent-storage-csi-snapshots`,
  SYSPREP: `${OPENSHIFT_DOC_URL}/4.10/virt/virtual_machines/virt-automating-windows-sysprep.html`,
  TAINTS_TOLERATION: `${OPENSHIFT_DOC_URL}/4.10/virt/virtual_machines/advanced_vm_management/virt-specifying-nodes-for-vms.html#virt-about-node-placement-vms_virt-specifying-nodes-for-vms`,
  TECH_PREVIEW: 'https://access.redhat.com/support/offerings/techpreview',
  VIRT_CTL: `${OPENSHIFT_DOC_URL}/4.15/virt/getting_started/virt-using-the-cli-tools.html`,
  VIRT_MANAGER_DOWNLOAD: 'https://virt-manager.org/download.html',
  VIRT_SECONDARY_NETWORK: `${OPENSHIFT_DOC_URL}/4.15/virt/vm_networking/virt-networking-overview.html#secondary-network-config`,
  VIRTUALIZATION_BLOG: `https://cloud.redhat.com/learn/topics/virtualization/`,
  VIRTUALIZATION_WHAT_YOU_CAN_DO:
    'https://docs.redhat.com/en/documentation/openshift_container_platform/4.16/html/virtualization/about#virt-what-you-can-do-with-virt_about-virt',
};
