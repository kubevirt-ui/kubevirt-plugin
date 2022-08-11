import { V1VirtualMachine, V1VirtualMachineInstance } from '@kubevirt-ui/kubevirt-api/kubevirt';

export type ConsoleDetailPropType = {
  address: string;
  port: string | number;
  tlsPort?: string | number;
};

export type onGenerateFunctionType = (
  console: ConsoleDetailPropType,
  type: string,
) => { content: string; mimeType: string };

export type onDownloadFunctionType = (fileName: string, content: string, mimeType: string) => void;

export type ConnectWithRemoteViewerProps = React.HTMLProps<HTMLDivElement> & {
  /** Custom content of more-info section  */
  children?: React.ReactNode;

  /** Connection details for Spice */
  spice?: ConsoleDetailPropType;
  /** Connection details for VNC */
  vnc?: ConsoleDetailPropType;
  /** Connection details for RDP */
  rdp?: ConsoleDetailPropType;

  /** Callback function. Generate content of .vv file.
   * Parameters: ({ _console, type }) => ({
   *     content,  // required string value
   *     mimeType, // optional, default application/x-virt-viewer
   *     fileName  // optional, default: console.vv
   *   })
   */
  onGenerate?: onGenerateFunctionType;
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

  textConnectWithRemoteViewer?: string;
  textMoreInfo?: string;
  textMoreInfoContent?: string | React.ReactNode;
  textConnectWithRDP?: string;
  textMoreRDPInfo?: string;
  textMoreRDPInfoContent?: string | React.ReactNode;
};

export type RDPProps = ConnectWithRemoteViewerProps & {
  /** Custom content of more-info section  */
  children?: React.ReactNode;
  /** Connection details for Spice */
  spice?: ConsoleDetailPropType;
  /** Connection details for VNC */
  vnc?: ConsoleDetailPropType;
  /** Connection details for RDP */
  rdp?: ConsoleDetailPropType;

  textManualConnection?: string;
  textNoProtocol?: string;
  textConnectWith?: string;

  textAddress?: string;
  textSpiceAddress?: string;
  textVNCAddress?: string;
  textSpicePort?: string;
  textVNCPort?: string;
  textSpiceTlsPort?: string;
  textVNCTlsPort?: string;
  textRDPPort?: string;
  textRdpAddress?: string;

  textConnectWithRemoteViewer?: string;
  textConnectWithRDP?: string;
  /** Text that appears in the toggle */
  textMoreInfo?: string;
  /** The information content appearing above the description list for guidelines to install virt-viewer */
  textMoreInfoContent?: string | React.ReactNode;
  /** Text that appears in the toggle */
  textMoreRDPInfo?: string;
  /** The information content appearing above the description list for guidelines to install virt-viewer */
  textMoreRDPInfoContent?: string | React.ReactNode;
  isLoading?: boolean;
};

export type ManualConnectionProps = React.HTMLProps<HTMLDivElement> & {
  spice?: ConsoleDetailPropType;
  vnc?: ConsoleDetailPropType;
  rdp?: ConsoleDetailPropType;

  textManualConnection: string;
  textNoProtocol: string;
  textConnectWith: string;

  textAddress: string;
  textSpiceAddress: string;
  textVNCAddress: string;
  textSpicePort: string;
  textVNCPort: string;
  textSpiceTlsPort: string;
  textVNCTlsPort: string;
  textRDPPort: string;
  textRdpAddress: string;
};

export type RemoteViewerProps = React.HTMLProps<HTMLDivElement> & {
  /** Custom content of more-info section  */
  children?: React.ReactNode;

  /** Connection details for Spice */
  spice?: ConsoleDetailPropType;
  /** Connection details for VNC */
  vnc?: ConsoleDetailPropType;
  /** Connection details for RDP */
  rdp?: ConsoleDetailPropType;

  /** Callback function. Generate content of .vv file.
   * Parameters: ({ _console, type }) => ({
   *     content,  // required string value
   *     mimeType, // optional, default application/x-virt-viewer
   *     fileName  // optional, default: console.vv
   *   })
   */
  onGenerate?: onGenerateFunctionType;
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

  textConnectWithRemoteViewer?: string;
  textMoreInfo?: string;
  textMoreInfoContent?: string | React.ReactNode;
  textConnectWithRDP?: string;
  textMoreRDPInfo?: string;
  textMoreRDPInfoContent?: string | React.ReactNode;
};

export type MoreInformationDefaultProps = {
  textMoreInfoContent?: string | React.ReactNode;
};

export type DesktopViewerProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
  type: string;
};

export type RDPServiceNotConfiguredProps = {
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
};

export type Network = {
  name: string;
  type: string;
  ip: string;
};

export type RDPConnectorProps = {
  rdpServiceAddressPort: ConsoleDetailPropType;
  vm: V1VirtualMachine;
  vmi: V1VirtualMachineInstance;
  isLoading: boolean;
};

export type MultusNetworkProps = {
  vmi: V1VirtualMachineInstance;
  selectedNetwork: Network;
};

export type DetailProps = {
  title?: string;
  value: string | number;
};
