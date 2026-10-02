/**
 * VM Templates are OpenShift Templates carrying the `template.kubevirt.io/type` label.
 *
 * They live under a plugin specific `vm-templates` path segment instead of `templates`,
 * which is the plural of Console's built-in TemplateModel. This way the plugin serves its
 * own (VM filtered) pages without shadowing the Console pages for Template resources.
 */
export const VM_TEMPLATES_PATH_SEGMENT = 'vm-templates';

export const VM_TEMPLATES_NS_PATH = `/k8s/ns/:ns/${VM_TEMPLATES_PATH_SEGMENT}`;
export const VM_TEMPLATES_ALL_NAMESPACES_PATH = `/k8s/all-namespaces/${VM_TEMPLATES_PATH_SEGMENT}`;
export const VM_TEMPLATES_NEW_PATH = `${VM_TEMPLATES_NS_PATH}/~new`;
export const VM_TEMPLATES_DETAILS_PATH = `${VM_TEMPLATES_NS_PATH}/:name`;
