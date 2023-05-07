export const parseNestedJSON = <T>(str: string): T => {
  try {
    return JSON.parse(str, (_, val) => {
      if (typeof val === 'string') return parseNestedJSON(val);
      return val;
    });
  } catch (exc) {
    return (<unknown>str) as T;
  }
};
