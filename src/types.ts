export type StatusLevel = 'NOMINAL' | 'WARNING' | 'CRITICAL';
export type TrendDirection = 'worsening' | 'improving' | 'stable';
export type MetricPolarity = 'higher-is-better' | 'higher-is-worse';

export interface ChallengeConfig {
  appName: string;
  problemStatement: string;
  domain: string;
  primaryMetricLabel: string;
  metricUnit?: string;
  metricPolarity: MetricPolarity;
  warningThreshold?: number;
  criticalThreshold?: number;
  showSDG: boolean;
  sdgAlignment?: string;
}

export interface DomainEntity {
  id: string;
  label: string;
  status: StatusLevel;
  primaryMetric: number;
  historicalData: { time: string; value: number }[];
  fallbackSummary: string;
  fallbackAction: string;
}

export interface AIInsightResponse {
  summary: string;
  action: string;
  confidence: number;
  source: 'live' | 'fallback';
}

export interface ParsedInsight {
  summary: string;
  action: string;
  confidence: number;
}
