import { NodeModel } from '@patternfly/react-topology';

import { mergeGroup } from '../transform-utils';

describe('transform-hooks', () => {
  describe('mergeGroup-util', () => {
    let mockgroupData: NodeModel[];
    beforeEach(() => {
      mockgroupData = [
        {
          id: '0001',
          label: 'gryffindor',
          type: 'hogwarts',
          group: true,
          children: ['011', '012', '013'],
        },
      ];
    });
    it('should create a new group if newGroup doesnt already exists', () => {
      const newGroup: NodeModel = {
        id: '0002',
        label: 'slytherin',
        type: 'hogwarts',
        group: true,
        children: ['021', '022', '023'],
      };
      const expectedResult = [...mockgroupData, newGroup];
      mergeGroup(newGroup, mockgroupData);
      expect(mockgroupData).toHaveLength(2);
      expect(mockgroupData).toEqual(expectedResult);
    });

    it('should add the data to an existing group if new group already exists', () => {
      const newGroup = {
        id: '0001',
        label: 'gryffindor',
        type: 'hogwarts',
        group: true,
        children: ['011', '015', '016'],
      };
      const expectedResult = [
        { ...mockgroupData[0], children: ['011', '012', '013', '015', '016'] },
      ];
      mergeGroup(newGroup, mockgroupData);
      expect(mockgroupData).toHaveLength(1);
      expect(mockgroupData).toEqual(expectedResult);
    });
  });
});
