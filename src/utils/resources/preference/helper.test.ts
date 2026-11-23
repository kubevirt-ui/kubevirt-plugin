import { VirtualMachineClusterPreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';
import { VirtualMachinePreferenceModel } from '@kubevirt-ui-ext/kubevirt-api/console';

import { getPreferenceModelFromMatcher } from './helper';

describe('preference/helper', () => {
  describe('getPreferenceModelFromMatcher', () => {
    it('selects namespaced model for canonical VirtualMachinePreference kind', () => {
      expect(
        getPreferenceModelFromMatcher({
          kind: VirtualMachinePreferenceModel.kind,
          name: 'user-pref',
        }),
      ).toEqual(expect.objectContaining({ kind: VirtualMachinePreferenceModel.kind }));
    });

    it('selects namespaced model for lowercase VirtualMachinePreference kind', () => {
      expect(
        getPreferenceModelFromMatcher({
          kind: 'virtualmachinepreference',
          name: 'user-pref',
        }),
      ).toEqual(expect.objectContaining({ kind: VirtualMachinePreferenceModel.kind }));
    });

    it('preserves cluster-scoped model for other kinds', () => {
      expect(
        getPreferenceModelFromMatcher({
          kind: VirtualMachineClusterPreferenceModel.kind,
          name: 'windows.2k19',
        }),
      ).toEqual(expect.objectContaining({ kind: VirtualMachineClusterPreferenceModel.kind }));
    });

    it('defaults to cluster model when kind is omitted', () => {
      expect(getPreferenceModelFromMatcher({ name: 'windows.2k19' })).toEqual(
        expect.objectContaining({ kind: VirtualMachineClusterPreferenceModel.kind }),
      );
    });
  });
});
