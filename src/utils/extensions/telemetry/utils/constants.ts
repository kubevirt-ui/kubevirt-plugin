// Legacy VM creation flow events (kept for backward compatibility)
export const VIEW_YAML_AND_CLI_CLICKED = 'View YAML & CLI button clicked';
export const BOOTABLE_VOLUME_SELECTED = 'Bootable volume selected';
export const INSTANCETYPE_SELECTED = 'InstanceType selected';
export const TEMPLATE_SELECTED = 'Template selected';
export const CREATE_VM_BUTTON_CLICKED = 'Create VirtualMachine button clicked';
export const CANCEL_CREATE_VM_BUTTON_CLICKED = 'Cancel Create VirtualMachine button clicked';
export const CREATE_VM_SUCCEEDED = 'Create VirtualMachine succeeded';
export const CREATE_VM_FAILED = 'Create VirtualMachine failed';
export const CUSTOMIZE_VM_BUTTON_CLICKED = 'Customize VirtualMachine button clicked';
export const CANCEL_CUSTOMIZE_VM_BUTTON_CLICKED = 'Cancel Customize VirtualMachine button clicked';
export const CUSTOMIZE_PAGE_CREATE_VM_BUTTON_CLICKED = 'Customize VirtualMachine button clicked';
export const CUSTOMIZE_VM_SUCCEEDED = 'Customize VirtualMachine succeeded';
export const CUSTOMIZE_VM_FAILED = 'Customize InstanceTypes VirtualMachine flow failed';

export const createVMFlowTypes = {
  InstanceTypes: 'InstanceTypes',
  Template: 'Template',
};

// VM Network events
export const VM_NETWORK_CREATION_STARTED = 'VM Network creation started';
export const VM_NETWORK_CREATED = 'VM Network created';
export const VM_NETWORK_CREATION_FAILED = 'VM Network creation failed';
export const VM_NETWORK_VLAN_ENABLED = 'VM Network VLAN enabled';
export const VM_NETWORK_MTU_CHANGED = 'VM Network MTU changed';
export const VM_NETWORK_ABANDONED = 'VM Network abandoned';

// VM Creation
export const VM_CREATION_STARTED = 'VM Creation Started';
export const VM_CREATED = 'VM Created';
export const VM_CREATION_FAILED = 'VM Creation Failed';

// Templates
export const TEMPLATE_CREATED = 'Template Created';
export const TEMPLATE_EDITED = 'Template Edited';

// Labels
export const VM_LABELS_COLLECTED = 'VM Labels Collected';

// Multi-cluster / Single pane of glass
export const MULTI_CLUSTER_MANAGEMENT_DETECTED = 'Multi-Cluster Management Detected';
export const CONSOLE_USED = 'Console Used';
export const TREE_VIEW_ACTION = 'Tree View Action';

// VM Live Migration
export const VM_MIGRATION_STARTED = 'VM Migration Started';
export const VM_MIGRATION_COMPLETED = 'VM Migration Completed';
export const VM_MIGRATION_FAILED = 'VM Migration Failed';
export const VM_MIGRATION_CLUSTER_LIMIT_CONFIGURED = 'VM Migration Cluster Limit Configured';
export const VM_MIGRATION_CLUSTER_LIMIT_REACHED = 'VM Migration Cluster Limit Reached';
export const VM_MIGRATION_NODE_LIMIT_CONFIGURED = 'VM Migration Node Limit Configured';
export const VM_MIGRATION_NODE_LIMIT_REACHED = 'VM Migration Node Limit Reached';

// Learning
export const HELP_ITEM_OPENED = 'Help Item Opened';
export const TASK_PROFICIENCY_MEASURED = 'Task Proficiency Measured';
export const USER_PROFICIENCY_MILESTONE = 'User Proficiency Milestone';
export const FEATURE_DEPTH_MEASURED = 'Feature Depth Measured';
export const TASK_ERROR_LOGGED = 'Task Error Logged';
export const LEARNING_SATISFACTION_SIGNAL = 'Learning Satisfaction Signal';

// Errors
export const VM_ERROR_DETECTED = 'VM Error Detected';
export const ERROR_RESOLUTION_ACTION = 'Error Resolution Action';
export const VM_ERROR_SUMMARY = 'VM Error Summary';
export const ERROR_RESOLUTION_MEASURED = 'Error Resolution Measured';

// VM Actions
export const VM_ACTION_PERFORMED = 'VM Action Performed';
export const VM_BULK_ACTION_PERFORMED = 'VM Bulk Action Performed';

// Storage
export const VM_DISK_ATTACHED = 'VM Disk Attached';
export const VM_DISK_HOTPLUG_ADDED = 'VM Disk Hotplug Added';
export const VM_DISK_HOTPLUG_REMOVED = 'VM Disk Hotplug Removed';
export const VM_DISK_HOTPLUG_FAILED = 'VM Disk Hotplug Failed';
export const VM_SNAPSHOT_CREATED = 'VM Snapshot Created';
export const VM_SNAPSHOT_RESTORED = 'VM Snapshot Restored';
export const VM_CLONED = 'VM Cloned';
export const VM_DISK_SUMMARY = 'VM Disk Summary';

// Dashboard
export const VM_DETAIL_TAB_VIEWED = 'VM Detail Tab Viewed';
export const VM_LIST_FILTERED = 'VM List Filtered';
export const VM_ADVANCED_SEARCH_MODAL_USED = 'VM Advanced Search Modal Used';
export const VM_SEARCH_LANGUAGE_USED = 'VM Search Language Used';
export const VM_SAVED_SEARCH_APPLIED = 'VM Saved Search Applied';
export const EXTERNAL_MONITORING_NAVIGATION = 'External Monitoring Navigation';
export const VM_CONSOLE_OPENED = 'VM Console Opened';

// Workload
export const VM_OS_COLLECTED = 'VM OS Collected';
export const VM_WORKLOAD_COLLECTED = 'VM Workload Collected';
export const VM_RESOURCES_COLLECTED = 'VM Resources Collected';
export const VM_GPU_ATTACHED = 'VM GPU Attached';

// MTV / Migration
export const MTV_DETECTED = 'MTV Detected';
export const MIGRATION_PLAN_CREATED = 'Migration Plan Created';
export const VM_MIGRATION_IMPORT_COMPLETED = 'VM Migration Import Completed';
export const POST_MIGRATION_VM_HEALTH = 'Post-Migration VM Health';

// Alerts
export const ALERT_FIRED = 'Alert Fired';
export const ALERT_INTERACTED = 'Alert Interacted';
export const ALERT_RESOLVED = 'Alert Resolved';
export const ALERT_SILENCED = 'Alert Silenced';

// YAML vs UI
export const RESOURCE_CREATED = 'Resource Created';
export const EDITOR_VIEW_SWITCHED = 'Editor View Switched';
export const RESOURCE_YAML_EDITED_POST_CREATION = 'Resource YAML Edited Post-Creation';
