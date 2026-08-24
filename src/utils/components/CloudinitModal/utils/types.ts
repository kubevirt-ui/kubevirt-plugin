export type CloudInitUserData = {
  chpasswd?: { expire?: boolean };
  hostname?: string;
  packages?: string[];
  password: string;
  runcmd?: Array<string | string[]>;
  user: string;
};

export type CloudInitNetworkData = {
  addresses: string;
  gateway4?: string;
  gateway6?: string;
  name: string;
};

export type CloudInitNetwork = {
  ethernets: {
    [name: string]: {
      addresses: string[];
      gateway4?: string;
      gateway6?: string;
    };
  };
  version: number;
};
