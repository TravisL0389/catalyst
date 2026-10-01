export type MemoryMode =
  | "ephemeral"
  | "selective"
  | "assisted"
  | "continuous"
  | "immersive";

export interface MemoryPolicy {
  readonly mode: MemoryMode;
  readonly allowAutomaticConsolidation: boolean;
  readonly requireConfirmationForAutomaticMemory: boolean;
  readonly retainRawImagery: boolean;
  readonly retainAudio: boolean;
  readonly rememberExplicitRequests: boolean;
}