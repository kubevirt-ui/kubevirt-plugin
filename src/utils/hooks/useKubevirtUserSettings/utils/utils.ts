export const parseNestedJSON = <T>(str: string): T => {
  try {
    return JSON.parse(str, (_key, val) => {
      if (typeof val === 'string') {
        return parseNestedJSON(val);
      }
      return val;
    });
  } catch {
    return (<unknown>str) as T;
  }
};
