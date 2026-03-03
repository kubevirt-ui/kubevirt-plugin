export type ExtraScoreItem = {
  name: string;
  value: string;
};

export type ScoreStatus = 'danger' | 'info' | 'warning';

export type StatusScoreItem = {
  extraCount?: number;
  extraItems?: ExtraScoreItem[];
  name: string;
  score: {
    description?: string;
    status: ScoreStatus;
    value: string;
  };
  tags?: string[];
};
