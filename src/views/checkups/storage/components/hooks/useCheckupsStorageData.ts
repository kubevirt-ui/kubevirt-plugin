import useCheckupsData from '../../../utils/hooks/useCheckupsData';
import { KUBEVIRT_STORAGE_LABEL_VALUE } from '../../utils/consts';

const useCheckupsStorageData = () => useCheckupsData({ labelValue: KUBEVIRT_STORAGE_LABEL_VALUE });

export default useCheckupsStorageData;
