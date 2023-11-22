import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type ConsoleDetailPropType = {
  address: string;
  port: number | string;
  tlsPort?: number | string;
};

export type onGenerateFunctionType = (
  console: ConsoleDetailPropType,
  type: string,
) => { content: string; mimeType: string };

export type onDownloadFunctionType = (fileName: string, content: string, mimeType: string) => void;

export type ConnectWithRemoteViewerProps = React.HTMLProps<HTMLDivElement> & {
  /** Custom content of more-info section  */
  children?: React.ReactNode;

  /** Callback function. Perform file download.
   * Default implementation is usually good enough, but i.e. in case of environment with tight
   * content security policy set, this might be required.
   *
   * Examples for alternative file-download implementations:
   *   - use of iframe
   *   - use of http-server
   *
   * Parameters: (fileName, content, mimeType) => {}
   */
  onDownload?: onDownloadFunctionType;
  /** Callback function. Generate content of .vv file.
   * Parameters: ({ _console, type }) => ({
   *     content,  // required string value
   *     mimeType, // optional, default application/x-virt-viewer
   *     fileName  // optional, default: console.vv
   *   })
   */
  onGenerate?: onGenerateFunctionType;
  /** Connection details for RDP */
  rdp?: ConsoleDetailPropType;

  /** Connection details for Spice */
  spice?: ConsoleDetailPropType;
  textConnectWithRDP?: string;

  textConnectWithRemoteViewer?: string;
  textMoreInfo?: string;
  textMoreInfoContent?: React.ReactNode | string;
  textMoreRDPInfo?: string;
  textMoreRDPInfoContent?: React.ReactNode | string;
  /** Connection details for VNC */
  vnc?: ConsoleDetailPropType;
};

export type RDPProps = ConnectWithRemoteViewerProps & {
  /** Custom content of more-info section  */
  children?: React.ReactNode;
  isLoading?: boolean;
  /** Connection details for RDP */
  rdp?: ConsoleDetailPropType;
  /** Connection details for Spice */
  spice?: ConsoleDetailPropType;

  textAddress?: string;
  textConnectWith?: string;
  textConnectWithRDP?: string;

  textConnectWithRemoteViewer?: string;
  textManualConnection?: string;
  /** Text that appears in the toggle */
  textMoreInfo?: string;
  /** The information content appearing above the description list for guidelines to install virt-viewer */
  textMoreInfoContent?: React.ReactNode | string;
  /** Text that appears in the toggle */
  textMoreRDPInfo?: string;
  /** The information content appearing above the description list for guidelines to install virt-viewer */
  textMoreRDPInfoContent?: React.ReactNode | string;
  textNoProtocol?: string;
  textRdpAddress?: string;
  textRDPPort?: string;

  textSpiceAddress?: string;
  textSpicePort?: string;
  textSpiceTlsPort?: string;
  textVNCAddress?: string;
  textVNCPort?: string;
  textVNCTlsPort?: string;
  /** Connection details for VNC */
  vnc?: ConsoleDetailPropType;
};

export type ManualConnectionProps = React.HTMLProps<HTMLDivElement> & {
  rdp?: ConsoleDetailPropType;
  spice?: ConsoleDetailPropType;
  textAddress: string;

  textConnectWith: string;
  textManualConnection: string;
  textNoProtocol: string;

  textRdpAddress: string;
  textRDPPort: string;
  textSpiceAddress: string;
  textSpicePort: string;
  textSpiceTlsPort: string;
  textVNCAddress: string;
  textVNCPort: string;
  textVNCTlsPort: string;
  vnc?: ConsoleDetailPropType;
};

export type RemoteViewerProps = React.HTMLProps<HTMLDivElement> & {
  /** Custom content of more-info section  */
  children?: React.ReactNode;

  /** Callback function. Perform file download.
   * Default implementation is usually good enough, but i.e. in case of environment with tight
   * content security policy set, this might be required.
   *
   * Examples for alternative file-download implementations:
   *   - use of iframe
   *   - use of http-server
   *
   * Parameters: (fileName, content, mimeType) => {}
   */
  onDownload?: onDownloadFunctionType;
  /** Callback function. Generate content of .vv file.
   * Parameters: ({ _console, type }) => ({
   *     content,  // required string value
   *     mimeType, // optional, default application/x-virt-viewer
   *     fileName  // optional, default: console.vv
   *   })
   */
  onGenerate?: onGenerateFunctionType;
  /** Connection details for RDP */
  rdp?: ConsoleDetailPropType;

  /** Connection details for Spice */
  spice?: ConsoleDetailPropType;
  textConnectWithRDP?: string;

  textConnectWithRemoteViewer?: string;
  textMoreInfo?: string;
  textMoreInfoContent?: React.ReactNode | string;
  textMoreRDPInfo?: string;
  textMoreRDPInfoContent?: React.ReactNode | string;
  /** Connection details for VNC */
  vnc?: ConsoleDetailPropType;
};

export type MoreInformationDefaultProps = {
  textMoreInfoContent?: React.ReactNode | string;
};

export type DesktopViewerProps = {
  type: string;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

export type RDPServiceNotConfiguredProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

export type Network = {
  ip: string;
  name: string;
  type: string;
};

export type RDPConnectorProps = {
  isLoading: boolean;
  rdpServiceAddressPort: ConsoleDetailPropType;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

export type MultusNetworkProps = {
  selectedNetwork: Network;
  vmi: V1VirtualMachineInstance;
};

export type DetailProps = {
  title?: string;
  value: number | string;
};
