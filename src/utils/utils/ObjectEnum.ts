import cloneDeepWith from 'lodash/cloneDeepWith';

export abstract class ObjectEnum<T> {
  protected readonly value: T;

  protected constructor(value: T) {
    if (!value) {
      throw new Error("ObjectEnum: value can't be empty");
    }
    this.value = value;
  }

  static getAll(): readonly ObjectEnum<unknown>[] {
    return Object.freeze([]);
  }

  protected static getAllClassEnumProperties<A extends ObjectEnum<unknown>>(): A[] {
    const entries = this as unknown as Record<string, unknown>;
    const usedValues = new Set<unknown>();
    return Object.keys(entries)
      .filter((key) => entries[key] instanceof ObjectEnum)
      .map((key) => {
        const result = entries[key] as A;
        if (usedValues.has(result.getValue())) {
          throw new Error(`${String(result)}: value must be unique`);
        }
        usedValues.add(result.getValue());
        return result;
      });
  }

  getValue(): T {
    return this.value;
  }

  toString(): string {
    if (this.value == null) {
      return '';
    }

    return this.value.toString();
  }
}

export const cloneDeepWithEnum = <T>(object: T): T => {
  return cloneDeepWith(object, (value) => {
    if (value instanceof ObjectEnum) {
      return value;
    }
    return undefined;
  });
};
