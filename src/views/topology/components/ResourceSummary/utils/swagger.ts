import findKey from 'lodash.findkey';
import memoize from 'lodash.memoize';
import toPath from 'lodash.topath';

import { get } from '@kubevirt-utils/utils/utils';
import {
  consoleFetchJSON,
  getGroupVersionKindForModel,
  K8sModel,
} from '@openshift-console/dynamic-plugin-sdk';

export const STORAGE_PREFIX = 'bridge';
const SWAGGER_LOCAL_STORAGE_KEY = `${STORAGE_PREFIX}/swagger-definitions`;

export const getDefinitionKey = memoize(
  (model: K8sModel, definitions: SwaggerDefinitions): string => {
    return findKey(definitions, (def: SwaggerDefinition) => {
      return def['x-kubernetes-group-version-kind']?.some(({ group, kind, version }) => {
        return (
          (model?.apiGroup ?? '') === (group || '') &&
          model?.apiVersion === version &&
          model?.kind === kind
        );
      });
    });
  },
  getGroupVersionKindForModel,
);

let swaggerDefinitions: SwaggerDefinitions;
export const getSwaggerDefinitions = (): SwaggerDefinitions => swaggerDefinitions;

export const fetchSwagger = async (): Promise<SwaggerDefinitions> => {
  // Remove any old definitions from `localSotrage`. We rely on the browser cache now.
  // TODO: We should be able to remove this in a future release.
  localStorage.removeItem(SWAGGER_LOCAL_STORAGE_KEY);
  try {
    const response: SwaggerAPISpec = await consoleFetchJSON('api/kubernetes/openapi/v2');
    if (!response.definitions) {
      // eslint-disable-next-line no-console
      console.error('Definitions missing in OpenAPI response.');
      return null;
    }
    swaggerDefinitions = response.definitions;
    return swaggerDefinitions;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Could not get OpenAPI definitions', e);
    return null;
  }
};

export const definitionFor = memoize((model: K8sModel): SwaggerDefinition => {
  if (!swaggerDefinitions) {
    return null;
  }
  const key = getDefinitionKey(model, swaggerDefinitions);
  // Some schemas might use $ref to reference an external schmema. In order for $ref to resolve,
  // the referenced schema must be defined in the `definitions` property of the
  // referencing schema.
  return {
    definitions: swaggerDefinitions,
    ...(swaggerDefinitions?.[key] ?? {}),
  };
}, getGroupVersionKindForModel);

const getRef = (definition: SwaggerDefinition): string => {
  const ref = definition.$ref || get(definition, 'items.$ref');
  const re = /^#\/definitions\//;
  // Only follow JSON pointers, not external URI references.
  return ref && re.test(ref) ? ref.replace(re, '') : null;
};

// Get the path in the swagger document to additional property details.
// This can be
// - A reference to another top-level definition
// - Inline property declartions
// - Inline property declartions for array items
export const getSwaggerPath = (
  allProperties: SwaggerDefinitions,
  currentPath: string[],
  name: string,
  followRef: boolean,
): string[] => {
  const nextPath = [...currentPath, 'properties', name];
  const definition = get(allProperties, nextPath) as SwaggerDefinition;
  if (!definition) {
    return null;
  }
  const ref = getRef(definition);
  return followRef && ref ? [ref] : nextPath;
};

const findDefinition = (kindObj: K8sModel, propertyPath: string[]): SwaggerDefinition => {
  if (!swaggerDefinitions) {
    return null;
  }

  const rootPath = getDefinitionKey(kindObj, swaggerDefinitions);
  const path = propertyPath.reduce(
    (currentPath: string[], nextProperty: string, i: number): string[] => {
      if (!currentPath) {
        return null;
      }
      // Don't follow the last reference since the description is not as good.
      const followRef = i !== propertyPath.length - 1;
      return getSwaggerPath(swaggerDefinitions, currentPath, nextProperty, followRef);
    },
    [rootPath],
  );

  return path ? (get(swaggerDefinitions, path) as SwaggerDefinition) : null;
};

export const getPropertyDescription = (
  kindObj: K8sModel,
  propertyPath: string | string[],
): string => {
  const path: string[] = toPath(propertyPath);
  const definition = findDefinition(kindObj, path);
  return definition ? definition.description : null;
};

export const getResourceDescription = memoize((kindObj: K8sModel): string => {
  if (!swaggerDefinitions) {
    return null;
  }
  const key = getDefinitionKey(kindObj, swaggerDefinitions);
  return get(swaggerDefinitions, [key, 'description']);
}, getGroupVersionKindForModel);

export type SwaggerDefinition = {
  $ref?: string;
  definitions?: SwaggerDefinitions;
  description?: string;
  enum?: string[];
  items?: SwaggerDefinition;
  properties?: {
    [prop: string]: SwaggerDefinition;
  };
  required?: string[];
  type?: string | string[];
};

export type SwaggerDefinitions = {
  [name: string]: SwaggerDefinition;
};

export type SwaggerAPISpec = {
  definitions: SwaggerDefinitions;
  info: { title: string; version: string };
  paths: { [path: string]: any };
  swagger: string;
};
