export type TopConsumersData = { [key: string]: any };

export type SetTopConsumerData = <T>(field: string, value: T) => void;

export type UseKubevirtUserSettingsTopConsumerCards = () => [TopConsumersData, SetTopConsumerData];
