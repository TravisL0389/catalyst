import type {
  Confidence,
  Provenance,
} from "@catalyst/core";

export type ModelTask =
  | "perception"
  | "reasoning"
  | "conversation"
  | "embedding"
  | "classification"
  | "planning";

export type ModelModality =
  | "text"
  | "image"
  | "audio"
  | "multimodal";

export interface ModelRequest {
  readonly task: ModelTask;
  readonly modality: ModelModality;
  readonly input: unknown;
  readonly maxLatencyMs?: number;
  readonly maxCost?: number;
}

export interface ModelResponse<T = unknown> {
  readonly output: T;
  readonly confidence: Confidence;
  readonly provenance: Provenance;
  readonly modelId: string;
}

export interface ModelProvider {
  readonly id: string;
  readonly capabilities: readonly ModelTask[];

  execute<T = unknown>(
    request: ModelRequest,
  ): Promise<ModelResponse<T>>;
}