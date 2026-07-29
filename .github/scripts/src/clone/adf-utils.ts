type AdfNode = {
  [key: string]: unknown;
  content?: AdfNode[];
  type: string;
};

type AdfDoc = {
  content: AdfNode[];
  type: string;
  version: number;
};

/** ADF node types that reference issue-specific assets and cannot be reused on create. */
const UNSUPPORTED_CLONE_NODES = new Set(['media', 'mediaSingle', 'mediaGroup', 'inlineCard']);

const sanitizeAdfNode = (node: AdfNode): AdfNode | null => {
  if (UNSUPPORTED_CLONE_NODES.has(node.type)) {
    return null;
  }

  if (!node.content) {
    return node;
  }

  const content = node.content
    .map(sanitizeAdfNode)
    .filter((child): child is AdfNode => child !== null);

  if (content.length === 0 && (node.type === 'paragraph' || node.type === 'heading')) {
    return null;
  }

  return { ...node, content };
};

/** Remove embedded media and other issue-bound nodes from an ADF description before cloning. */
export const sanitizeDescriptionForClone = (description: unknown): undefined | unknown => {
  if (description === null || description === undefined) {
    return undefined;
  }

  if (typeof description !== 'object') {
    return description;
  }

  const doc = description as AdfDoc;
  if (doc.type !== 'doc' || !Array.isArray(doc.content)) {
    return description;
  }

  const content = doc.content.map(sanitizeAdfNode).filter((node): node is AdfNode => node !== null);

  if (content.length === 0) {
    return undefined;
  }

  return { ...doc, content };
};
