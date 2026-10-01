import type {
  ModelProvider,
  ModelRequest,
  ModelResponse,
} from "./model-types.js";

export interface ModelRouter {
  registerProvider(provider: ModelProvider): void;

  route<T = unknown>(
    request: ModelRequest,
  ): Promise<ModelResponse<T>>;
}

export class DefaultModelRouter implements ModelRouter {
  private readonly providers = new Map<string, ModelProvider>();

  registerProvider(provider: ModelProvider): void {
    this.providers.set(provider.id, provider);
  }

  async route<T = unknown>(
    request: ModelRequest,
  ): Promise<ModelResponse<T>> {
    const provider = [...this.providers.values()].find((candidate) =>
      candidate.capabilities.includes(request.task),
    );

    if (!provider) {
      throw new Error(
        `No model provider available for task: ${request.task}`,
      );
    }

    return provider.execute<T>(request);
  }
}