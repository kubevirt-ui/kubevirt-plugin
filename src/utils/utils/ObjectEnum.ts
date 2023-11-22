import cloneDeepWith from 'lodash.clonedeepwith';

export abstract class ObjectEnum<T> {
  static getAll = () => Object.freeze([]);

  protected static getAllClassEnumProperties = <A extends ObjectEnum<any>>(Clazz: any) => {
    const usedValues = new Set();
    return Object.keys(Clazz)
      .filter((value) => Clazz[value] instanceof Clazz)
      .map((key) => {
        const result = Clazz[key];
        if (usedValues.has(result.getValue())) {
          throw new Error(`${result}: value must be unique`);
        }
        usedValues.add(result.getValue());
        return result;
      }) as A[];
  };

  getValue = () => this.value;

  protected readonly value: T;

  protected constructor(value: T) {
    if (!value) {
      throw new Error("ObjectEnum: value can't be empty");
    }
    this.value = value;
  }

  toString() {
    if (this.value === null || this.value === undefined) {
      return '';
    }

    return this.value.toString();
  }
}

export const cloneDeepWithEnum = (object) => {
  return cloneDeepWith(object, (value) => {
    if (value instanceof ObjectEnum) {
      return value;
    }
    return undefined;
  });
};
