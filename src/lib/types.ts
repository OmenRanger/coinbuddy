export type ValueConfidence = 'low' | 'medium' | 'high';

export type ValueSource = {
  id: string;
  sourceName: string;
  sourceUrl?: string;
  saleDate?: string;
  observedPrice?: number;
  notes?: string;
};

export type Coin = {
  id: string;
  name: string;
  country?: string;
  denomination?: string;
  year?: string;
  mintMark?: string;
  composition?: string;
  condition?: string;
  gradeEstimate?: string;
  estimatedValueLow?: number;
  estimatedValueMid?: number;
  estimatedValueHigh?: number;
  valueConfidence?: ValueConfidence;
  valueSources?: ValueSource[];
  obverseImageUrl?: string;
  reverseImageUrl?: string;
  acquisitionDate?: string;
  acquisitionSource?: string;
  purchasePrice?: number;
  storageLocation?: string;
  notes?: string;
  tags?: string[];
  favorite?: boolean;
  needsReview?: boolean;
  createdAt: string;
  updatedAt: string;
};
