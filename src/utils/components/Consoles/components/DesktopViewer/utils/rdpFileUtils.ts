import { saveAs } from 'file-saver';

import {
  type V1VirtualMachine,
  type V1VirtualMachineInstance,
} from '@kubevirt-ui-ext/kubevirt-api/kubevirt';

import { RDP_CONSOLE_TYPE, SPICE_CONSOLE_TYPE, VNC_CONSOLE_TYPE } from '../../utils/ConsoleConsts';
import {
  DEFAULT_RDP_MIMETYPE,
  DEFAULT_RDP_PORT,
  DEFAULT_VV_MIMETYPE,
  MULTUS,
  POD,
} from './constants';
import { type ConsoleDetailPropType, type Network } from './types';

export const downloadFile = (fileName: string, content: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  saveAs(blob, fileName);
};

const generateVVFile = (
  console: ConsoleDetailPropType,
  type: string,
): { content: string; mimeType: string } => {
  const TYPES = {
    [SPICE_CONSOLE_TYPE]: 'spice',
    [VNC_CONSOLE_TYPE]: 'vnc',
  };

  const content =
    '[virt-viewer]\n' +
    `type=${TYPES?.[type] ?? type}\n` +
    `host=${console?.address}\n` +
    `port=${console?.port}\n` +
    'delete-this-file=1\n' +
    'fullscreen=0\n';

  return {
    content,
    mimeType: DEFAULT_VV_MIMETYPE,
  };
};

const generateRDPFile = (console: ConsoleDetailPropType): { content: string; mimeType: string } => {
  const port = console?.port ?? DEFAULT_RDP_PORT;
  const content = [
    `full address:s:${console?.address}:${port}`,
    '\nusername:s:Administrator',
    '\nscreen mode id:i:2',
    '\nprompt for credentials:i:1',
    '\ndesktopwidth:i:0',
    '\ndesktopheight:i:0',
    '\nauthentication level:i:2',
    '\nredirectclipboard:i:1',
    '\nsession bpp:i:32',
    '\ncompression:i:1',
    '\nkeyboardhook:i:2',
    '\naudiocapturemode:i:0',
    '\nvideoplaybackmode:i:1',
    '\nconnection type:i:2',
    '\ndisplayconnectionbar:i:1',
    '\ndisable wallpaper:i:1',
    '\nallow font smoothing:i:1',
    '\nallow desktop composition:i:0',
    '\ndisable full window drag:i:1',
    '\ndisable menu anims:i:1',
    '\ndisable themes:i:0',
    '\ndisable cursor setting:i:0',
    '\nbitmapcachepersistenable:i:1',
    '\naudiomode:i:0',
    '\nredirectcomports:i:0',
    '\nredirectposdevices:i:0',
    '\nredirectdirectx:i:1',
    '\nautoreconnection enabled:i:1',
    '\nnegotiate security layer:i:1',
    '\nremoteapplicationmode:i:0',
    '\nalternate shell:s:',
    '\nshell working directory:s:',
    '\ngatewayhostname:s:',
    '\ngatewayusagemethod:i:4',
    '\ngatewaycredentialssource:i:4',
    '\ngatewayprofileusagemethod:i:0',
    '\npromptcredentialonce:i:1',
    '\nuse redirection server name:i:0',
    '\n',
  ].join('');

  return {
    content,
    mimeType: DEFAULT_RDP_MIMETYPE,
  };
};

export const generateDescriptorFile = (
  console: ConsoleDetailPropType,
  type: string,
): { content: string; mimeType: string } =>
  type === RDP_CONSOLE_TYPE ? generateRDPFile(console) : generateVVFile(console, type);

export const getVmRdpNetworks = (
  vm: V1VirtualMachine,
  vmi: V1VirtualMachineInstance,
): Network[] => {
  const networks = vm?.spec?.template?.spec?.networks?.filter(
    (network) => network?.multus ?? network?.pod,
  );
  return (vmi?.status?.interfaces ?? [])
    .filter((iface) => networks?.some((network) => network?.name === iface?.name))
    .map((iface) => {
      let ipAddress = iface?.ipAddress;
      if (ipAddress) {
        const subnetIndex = iface?.ipAddress?.indexOf('/');
        if (subnetIndex !== undefined && subnetIndex > 0) {
          ipAddress = iface?.ipAddress?.slice(0, subnetIndex);
        }
      }
      const network = networks?.find((net) => net?.name === iface?.name);
      return {
        ip: ipAddress,
        name: iface?.name,
        type: network?.multus ? MULTUS : POD,
      };
    });
};

export const getDefaultNetwork = (networks: Network[]): Network | null => {
  if (networks?.length === 1) {
    return networks?.[0];
  }
  if (networks?.length > 1) {
    return (
      networks?.find((network) => network?.type === POD && network?.ip) ??
      networks?.find((network) => network?.type === MULTUS)
    );
  }
  return null;
};
