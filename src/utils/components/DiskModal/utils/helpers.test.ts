import { V1VirtualMachine } from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { createDataVolumeName } from './helpers';

const vm = (name: string): V1VirtualMachine => ({ metadata: { name }, spec: { template: {} } });
const RANDOM_CHARS = /[a-z0-9]/;

describe('Generate names for data volume', () => {
  test('simple name', () => {
    const name = createDataVolumeName(vm('foo'), 'bar');
    expect(name).toHaveLength(17);
    expect(name.substring(0, 11)).toEqual('dv-foo-bar-');
    expect(name.substring(11, 18)).toMatch(RANDOM_CHARS);
  });
  it('truncates too long names and remove trailing hyphen', () => {
    const name52CharsLong = '52charlong52charlong52charlong52charlong52charlong52';
    const name = createDataVolumeName(vm(name52CharsLong), 'bar');
    expect(name).toHaveLength(62);
    expect(name.substring(0, 56)).toEqual(`dv-${name52CharsLong}-`);
  });

  it('skips invalid disk and vm name', () => {
    const name = createDataVolumeName(vm('Foo'), '*bar*');
    expect(name).toHaveLength(9);
    expect(name.substring(0, 3)).toEqual('dv-');
    expect(name.substring(3, 9)).toMatch(RANDOM_CHARS);
  });
});
