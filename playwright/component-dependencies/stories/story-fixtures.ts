/** Minimal VM object for gallery form defaults (see `StoryFormProvider`). */
export const storyVmObject = {
  apiVersion: 'kubevirt.io/v1',
  kind: 'VirtualMachine',
  metadata: { name: 'story-vm', namespace: 'default' },
  spec: {
    template: {
      spec: {
        affinity: {},
        domain: { devices: {} },
      },
    },
  },
};
