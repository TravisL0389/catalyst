import type { MemoryId, UserId } from "@catalyst/core";
import type { MemoryRecord } from "./memory-types.js";
import type { MemoryStore } from "./memory.js";

export class InMemoryMemoryStore implements MemoryStore {
  private readonly memories = new Map<
    MemoryId,
    MemoryRecord
  >();

  async save(
    memory: MemoryRecord,
  ): Promise<MemoryRecord> {
    this.memories.set(memory.id, memory);
    return memory;
  }

  async recall(
    query: string,
    userId: UserId,
  ): Promise<readonly MemoryRecord[]> {
    const normalizedQuery = query.toLowerCase();

    return [...this.memories.values()].filter(
      (memory) =>
        memory.userId === userId &&
        memory.status !== "deleted" &&
        memory.content.toLowerCase().includes(normalizedQuery),
    );
  }

  async getById(
    id: MemoryId,
  ): Promise<MemoryRecord | null> {
    return this.memories.get(id) ?? null;
  }

  async forget(id: MemoryId): Promise<void> {
    const memory = this.memories.get(id);

    if (!memory) {
      return;
    }

    this.memories.set(id, {
      ...memory,
      status: "deleted",
      updatedAt: new Date().toISOString() as MemoryRecord["updatedAt"],
    });
  }
}