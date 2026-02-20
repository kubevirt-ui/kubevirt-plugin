// IMPORTANT: This file adds comments recognized by the react-i18next-parser so that
// labels declared in console extensions are added to the message catalog.

// TODO: We should make the custom i18next JSON lexer available to plugins so
// that they dont need this file.

// t('plugin__kubevirt-plugin~Cluster')
// t('plugin__kubevirt-plugin~Virtualization')
// t('plugin__kubevirt-plugin~VirtualMachines')
// t('plugin__kubevirt-plugin~Virtual Machines')
// t('plugin__kubevirt-plugin~Create Virtual Machine')
// t('plugin__kubevirt-plugin~Catalog')
// t('plugin__kubevirt-plugin~VirtualMachineInstances')
// t('plugin__kubevirt-plugin~Templates')
// t('plugin__kubevirt-plugin~Overview')
// t('plugin__kubevirt-plugin~MTV')
// t('plugin__kubevirt-plugin~Last 5 minutes')
// t('plugin__kubevirt-plugin~Last 15 minutes')
// t('plugin__kubevirt-plugin~Last 30 minutes')
// t('plugin__kubevirt-plugin~Last 1 hour')
// t('plugin__kubevirt-plugin~Last 3 hours')
// t('plugin__kubevirt-plugin~Last 6 hours')
// t('plugin__kubevirt-plugin~Last 12 hours')
// t('plugin__kubevirt-plugin~Last 1 day')
// t('plugin__kubevirt-plugin~Last 1 week')
// t('plugin__kubevirt-plugin~By CPU')
// t('plugin__kubevirt-plugin~CPU')
// t('plugin__kubevirt-plugin~By memory')
// t('plugin__kubevirt-plugin~Memory')
// t('plugin__kubevirt-plugin~By memory swap traffic')
// t('plugin__kubevirt-plugin~Memory swap traffic')
// t('plugin__kubevirt-plugin~By vCPU wait')
// t('plugin__kubevirt-plugin~vCPU wait')
// t('plugin__kubevirt-plugin~By throughput')
// t('plugin__kubevirt-plugin~Storage throughput')
// t('plugin__kubevirt-plugin~By IOPS')
// t('plugin__kubevirt-plugin~Storage IOPS')
// t('plugin__kubevirt-plugin~PersistentVolumes')
// t('plugin__kubevirt-plugin~PersistentVolumeClaims')
// t('plugin__kubevirt-plugin~StorageClasses')
// t('plugin__kubevirt-plugin~MachineHealthChecks')
// t('plugin__kubevirt-plugin~MachineConfigs')
// t('plugin__kubevirt-plugin~Services')
// t('plugin__kubevirt-plugin~VolumeSnapshotContents')
// t('plugin__kubevirt-plugin~Routes')
// t('plugin__kubevirt-plugin~Ingresses')
// t('plugin__kubevirt-plugin~NetworkPolicies')
// t('plugin__kubevirt-plugin~MachineConfigPools')
// t('plugin__kubevirt-plugin~Project')
// t('plugin__kubevirt-plugin~VM')
// t('plugin__kubevirt-plugin~Node')
// t('plugin__kubevirt-plugin~Create a Virtual Machine from a template')
// t('plugin__kubevirt-plugin~Hardware Devices')
// t('plugin__kubevirt-plugin~OpenShift Virtualization')
// t('plugin__kubevirt-plugin~Storage migrations')
// t('plugin__kubevirt-plugin~Storage MigrationPlans')
// t('plugin__kubevirt-plugin~Cross cluster migration')

// SSH service type titles - used in SSHAccess/constants.ts via t(serviceTypeTitles[type])
// t('SSH over LoadBalancer')
// t('SSH over NodePort')
// t('None')

// Boot mode titles - used in FirmwareBootloaderModal/utils/constants.ts as selectedLabel
// t('BIOS')
// t('IPL')
// t('UEFI')
// t('UEFI (secure)')

// Boot mode descriptions - used in FirmwareBootloaderModal/utils/constants.ts as option descriptions
// t('Use BIOS when bootloading the guest OS')
// t('Use UEFI when bootloading the guest OS.')
// t('Use UEFI when bootloading the guest OS. Requires SMM feature, if the SMM feature is not set, choosing this method will set it to true')
// t('Use IPL (Initial Program Load) when bootloading the guest OS')

// Disk type labels - used in vm/utils/disk/constants.ts as selectedLabel and filter titles
// t('CD-ROM')
// t('Disk')
// t('LUN')

// VMs per resource options - used in vms-per-resource-card/utils/constants.ts via t(scope.title)
// t('Show VirtualMachine per Templates')
// t('Show VirtualMachine per InstanceTypes')
// t('Show uncategorized VirtualMachines')

// Guided tour strings - used in GuidedTour/utils/constants.tsx as tour step titles and content
// t('Getting started resources')
// t('Learn more about key areas to complete workflows, increase productivity, and familiarize yourself with Virtualization using our resources.')
// t('Project selector')
// t('To create VirtualMachines in a project, you must first create a new project and become the administrator.')
// t('Settings configurations')
// t('You can set the cluster and your individual preferences in the Settings tab on the Overview page.')
// t('Tree view')
// t('Visualize all your VirtualMachines and easily navigate between them using the tree view. You can also see their details with a status summary.')
// t('Add volume')
// t('Public SSH key')
// t('Before creating a virtual machine, we recommend that you configure the public SSH key. It will be saved in the project as a secret. You can configure the public SSH key at a later time, but this is the easiest way.')
// t('Search for configurable items')
// t('On the Configuration tab on the VirtualMachine page, you can search for and edit any configurable item using the search box.')
// t('You are ready to go!')

// URL source helper text - used in DiskSourceUrlInput/URLSourceHelperText.tsx via t(osEntry.field)
// TODO: Replace three-part concatenation with single interpolated translation key
// t('Example: For CentOS, visit the ')
// t('CentOS cloud image list ')
// t('and copy the download link URL for the cloud base image')
// t('Example: For Fedora, visit the ')
// t('Fedora cloud image list ')
// t('Example: For RHEL, visit the ')
// t('RHEL download page ')
// t('(requires login) and copy the download link URL of the KVM guest image (expires quickly)')
// t('Example: For Windows, get a link to the ')
// t('installation iso of Microsoft Windows 10 ')
// t('and copy the download link URL')

// Source options - used in StorageSection/CustomizeSource/SelectSourceOption.tsx via t(option.label/description)
// t('Blank')
// t('Create a new blank PVC')
// t('Registry (ContainerDisk)')
// t('Import content via container registry.')
// t('Template default')
// t('Use the default Template disk source')
// t('URL (creates PVC)')
// t('Import content via URL (HTTP or HTTPS endpoint).')
// t('PVC (clone PVC)')
// t('Select an existing persistent volume claim already available on the cluster and clone it.')
// t('Registry (creates PVC)')
// t('Upload (Upload a new file to a PVC)')
// t('Upload a new file to a PVC. A new PVC will be created.')

// NOT_SUPPORTED_VM_ERROR - used in catalog/CreateFromInstanceTypes via t(NOT_SUPPORTED_VM_ERROR.message)
// t('VirtualMachine creation is not supported due to incompatible UserDefinedNetwork configuration')

// Workload labels - WORKLOADS_LABELS values translated in components via t(WORKLOADS_LABELS[workload])
// t('Desktop')
// t('High performance')
// t('Server')

// Boot source labels - BOOT_SOURCE_LABELS values translated in components via t(getVMBootSourceLabel(...))
// t('Container disk')
// t('PVC')
// t('PVC (auto import)')
// t('No boot source')
// t('Registry')
// t('Snapshot')
// t('URL')

// Instance type menu items - initialMenuItems labels translated in InstanceTypeDrilldownSelect.tsx
// t('Red Hat provided')
// t('User provided')

// Instance type series labels - generated via getSeriesLabel() using interpolation
// t('{{symbol}} series')

// Disk interface options - diskInterfaceOptions labels translated in DiskInterfaceSelect.tsx
// t('SATA')
// t('SCSI')
// t('VirtIO')

// Disk interface descriptions - diskInterfaceOptions descriptions translated in DiskInterfaceSelect.tsx
// t('Supported by most operating systems including Windows out of the box. Offers lower performance compared to virtio. Consider using it for CD-ROM devices.')
// t('Paravirtualized iSCSI HDD driver offers similar functionality to the virtio-block device, with some additional enhancements. In particular, this driver supports adding hundreds of devices, and names devices using the standard SCSI device naming scheme.')
// t('Optimized for best performance. Supported by most Linux distributions. Windows requires additional drivers to use this model.')

// Search filter placeholders - STATIC_SEARCH_FILTERS_PLACEHOLDERS values translated in getSearchTextPlaceholder
// t('Search by labels...')
// t('Search by name...')

// Health condition labels - VALUE_TO_LABLE values translated in Conditions.tsx
// t('Healthy')
// t('Warning')
// t('Error')
