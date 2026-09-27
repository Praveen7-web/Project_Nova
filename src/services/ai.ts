import { GoogleGenAI, Type } from '@google/genai';
import type {
  DomainEntity,
  AIInsightResponse,
  TrendDirection,
  MetricPolarity,
  ChallengeConfig,
  StatusLevel,
  ParsedInsight
} from '../types';

const insightSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "Exactly two-sentence operational interpretation of the trend" },
    action: { type: Type.STRING, description: "Exactly one-sentence recommended action" },
    confidence: { type: Type.NUMBER, description: "Model self-reported confidence from 0.0 to 1.0" }
  },
  required: ["summary", "action", "confidence"],
  propertyOrdering: ["summary", "action", "confidence"]
};

export function validateThresholds(config: ChallengeConfig): void {
  const { warningThreshold, criticalThreshold, metricPolarity } = config;
  if (warningThreshold === undefined || criticalThreshold === undefined) return;

  if (!Number.isFinite(warningThreshold) || !Number.isFinite(criticalThreshold)) {
    throw new Error("Threshold Safety Violation: Thresholds must be finite numbers.");
  }
  if (metricPolarity === 'higher-is-worse' && warningThreshold >= criticalThreshold) {
    throw new Error(`Threshold Safety Violation: warningThreshold (${warningThreshold}) must be < criticalThreshold (${criticalThreshold}).`);
  }
  if (metricPolarity === 'higher-is-better' && criticalThreshold >= warningThreshold) {
    throw new Error(`Threshold Safety Violation: criticalThreshold (${criticalThreshold}) must be < warningThreshold (${warningThreshold}).`);
  }
}

function isParsedInsight(value: unknown): value is ParsedInsight {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.summary === 'string' && c.summary.trim().length > 0 &&
    typeof c.action === 'string' && c.action.trim().length > 0 &&
    typeof c.confidence === 'number' && Number.isFinite(c.confidence) &&
    c.confidence >= 0 && c.confidence <= 1
  );
}

export function deriveStatus(value: number, config: ChallengeConfig): StatusLevel {
  const { warningThreshold, criticalThreshold, metricPolarity } = config;
  if (warningThreshold === undefined || criticalThreshold === undefined) return 'NOMINAL';
  if (metricPolarity === 'higher-is-worse') {
    if (value >= criticalThreshold) return 'CRITICAL';
    if (value >= warningThreshold) return 'WARNING';
    return 'NOMINAL';
  } else {
    if (value <= criticalThreshold) return 'CRITICAL';
    if (value <= warningThreshold) return 'WARNING';
    return 'NOMINAL';
  }
}

export function calculateTrend(data: { value: number }[], polarity: MetricPolarity): TrendDirection {
  if (data.length < 2) return 'stable';
  const first = data[0].value;
  const last = data[data.length - 1].value;
  let isIncreasing = false, isDecreasing = false;

  if (first === 0) {
    if (last === 0) return 'stable';
    isIncreasing = last > 0;
    isDecreasing = last < 0;
  } else {
    const diff = (last - first) / Math.abs(first);
    if (Math.abs(diff) <= 0.05) return 'stable';
    isIncreasing = diff > 0.05;
    isDecreasing = diff < -0.05;
  }

  if (polarity === 'higher-is-better') {
    if (isIncreasing) return 'improving';
    if (isDecreasing) return 'worsening';
  } else {
    if (isIncreasing) return 'worsening';
    if (isDecreasing) return 'improving';
  }
  return 'stable';
}

export async function generateInsight(entityData: DomainEntity, config: ChallengeConfig): Promise<AIInsightResponse> {
  const trend = calculateTrend(entityData.historicalData, config.metricPolarity);
  const fallbackResponse: AIInsightResponse = {
    summary: entityData.fallbackSummary,
    action: entityData.fallbackAction,
    confidence: 0,
    source: 'fallback'
  };

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 8000);

  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing API Key");

    const { fallbackSummary, fallbackAction, ...cleanEntityData } = entityData;
    const ai = new GoogleGenAI({ apiKey });

    const promptText = `
Use ONLY the supplied challenge data.
Do not invent measurements, causes, external statistics, or events.
The deterministic trend calculation is authoritative. Do not change or reinterpret it.

Domain: ${config.domain}
Metric: ${config.primaryMetricLabel}
Unit: ${config.metricUnit ?? 'unitless'}
Metric Polarity: ${config.metricPolarity} (Higher values are ${config.metricPolarity === 'higher-is-better' ? 'desirable/improving' : 'adverse/worsening'})
Deterministic Trend: ${trend}

Provide:
- exactly two sentences for summary
- exactly one sentence for action
- model-reported confidence from 0.0 to 1.0

Data:
${JSON.stringify(cleanEntityData)}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: insightSchema,
        abortSignal: abortController.signal
      }
    });

    const responseText = response.text;
    if (!responseText) throw new Error("Empty AI response text");

    const parsed: unknown = JSON.parse(responseText);
    if (!isParsedInsight(parsed)) throw new Error("Invalid AI response schema structure");

    return { ...parsed, source: 'live' };
  } catch (error) {
    console.warn("AI Generation failed or failed validation, using fallback.", error);
    return fallbackResponse;
  } finally {
    clearTimeout(timeoutId);
  }
}
