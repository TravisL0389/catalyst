export type Timestamp = string & {
  readonly __brand: "Timestamp";
};

export function now(): Timestamp {
  return new Date().toISOString() as Timestamp;
}

export function asTimestamp(value: string): Timestamp {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${value}`);
  }

  return date.toISOString() as Timestamp;
}