import useCheckupsData from '../../../utils/hooks/useCheckupsData';
import { KUBEVIRT_STORAGE_LABEL_VALUE } from '../../utils/consts';

type UseCheckupsStorageDataResult = ReturnType<typeof useCheckupsData>;

const useCheckupsStorageData = (): UseCheckupsStorageDataResult =>
  useCheckupsData({ labelValue: KUBEVIRT_STORAGE_LABEL_VALUE });

export default useCheckupsStorageData;
