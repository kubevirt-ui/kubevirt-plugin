import { EnvironmentKind, EnvironmentVariable } from '../constants';
import { areEnvironmentsChanged } from '../utils';

const env1Name = 'test-1';
const env1Serial = '1234';
const env1Disk = 'disk1';

const env2Name = 'test-2';
const env2Serial = '4321';
const env2Disk = 'disk2';

describe('utils tests', () => {
  describe('areEnvironmentsChanged tests', () => {
    it('shuffle Envs', () => {
      const initialEnvironments: EnvironmentVariable[] = [
        { diskName: env1Disk, kind: EnvironmentKind.secret, name: env1Name, serial: env1Serial },
        { diskName: env2Disk, kind: EnvironmentKind.secret, name: env2Name, serial: env2Serial },
      ];
      const newEnvironment: EnvironmentVariable[] = [
        { diskName: env1Disk, kind: EnvironmentKind.secret, name: env2Name, serial: env2Serial },
        { diskName: env1Disk, kind: EnvironmentKind.secret, name: env1Name, serial: env1Serial },
      ];
      expect(areEnvironmentsChanged(newEnvironment, initialEnvironments)).toBeFalsy();
    });

    it('added Env', () => {
      const initialEnvironments: EnvironmentVariable[] = [
        { diskName: env2Disk, kind: EnvironmentKind.secret, name: env2Name, serial: env2Serial },
      ];
      const newEnvironment: EnvironmentVariable[] = [
        { diskName: env2Disk, kind: EnvironmentKind.secret, name: env2Name, serial: env2Serial },
        { diskName: env1Disk, kind: EnvironmentKind.secret, name: env1Name, serial: env1Serial },
      ];

      expect(areEnvironmentsChanged(newEnvironment, initialEnvironments)).toBeTruthy();
    });

    it('Removed Env', () => {
      const newEnvironment: EnvironmentVariable[] = [
        { diskName: env2Disk, kind: EnvironmentKind.secret, name: env2Name, serial: env2Serial },
      ];
      const initialEnvironments: EnvironmentVariable[] = [
        { diskName: env2Disk, kind: EnvironmentKind.secret, name: env2Name, serial: env2Serial },
        { diskName: env1Disk, kind: EnvironmentKind.secret, name: env1Name, serial: env1Serial },
      ];

      expect(areEnvironmentsChanged(newEnvironment, initialEnvironments)).toBeTruthy();
    });
  });
});
