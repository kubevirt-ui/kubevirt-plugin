import { load } from 'js-yaml';

export const safeLoad = <Resource>(value: string): Resource | undefined => {
  try {
    return load(value) as Resource;
  } catch (error) {
    console.error(error);
    return;
  }
};

export type LineRange = { end: number; start: number };

const getLineFromPath = (resourceYAML: string, path): LineRange => {
  const yamlLines = resourceYAML.split('\n');
  const range = { end: yamlLines.length - 1, start: 0 };

  const properties = path.split('.');

  for (const propertyDepth in properties) {
    const property = properties[propertyDepth];

    // at every iteration, go one level deeper, remove initial indentation for that range.
    const replaceIndentationRegex = new RegExp(`^[ ]{${2 * parseInt(propertyDepth)}}`);

    const rangeLines = yamlLines
      .slice(range.start + 1, range.end)
      .map((line) => line.replace(replaceIndentationRegex, ''));

    // find the property
    const startPropertyRange = rangeLines.findIndex((line) => line.startsWith(`${property}:`));

    // find next property at same depth level
    let rangeLength = rangeLines
      .slice(startPropertyRange + 1)
      .findIndex((line) => line.match(/^[A-z]+:/g));

    if (rangeLength === -1) rangeLength = rangeLines.length - startPropertyRange;

    // property not found
    if (startPropertyRange === -1) return undefined;

    range.start += startPropertyRange + 1;

    range.end = range.start + rangeLength;
  }

  // editor lines starts from 1, array starts from 0
  range.start += 1;
  range.end += 1;
  return range;
};

export const getLinesToHighlight = (
  resourceYAML: string,
  pathsToHighlight: string[],
): LineRange[] =>
  pathsToHighlight
    .map((path) => getLineFromPath(resourceYAML, path))
    .filter((highlightLine) => !!highlightLine);

export const createSelection = (range: LineRange) => ({
  endColumn: 0,
  endLineNumber: range.end + 1,
  positionColumn: 0,
  positionLineNumber: range.end + 1,
  selectionStartColumn: 0,
  selectionStartLineNumber: range.start,
  startColumn: 0,
  startLineNumber: range.start,
});
