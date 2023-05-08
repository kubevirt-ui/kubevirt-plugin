export interface JSONSchema7Object {
  [key: string]: JSONSchema7Type;
}

export type JSONSchema7TypeName =
  | 'string' //
  | 'number'
  | 'integer'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null';

export type JSONSchema7Type =
  | string //
  | number
  | boolean
  | JSONSchema7Object
  | JSONSchema7Array
  | null;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface JSONSchema7Array extends Array<JSONSchema7Type> {}

export type JSONSchema7Version = string;

export type JSONSchema7Definition = JSONSchema7 | boolean;
export interface JSONSchema7 {
  $id?: string;
  $ref?: string;
  $schema?: JSONSchema7Version;
  $comment?: string;
  type?: JSONSchema7TypeName | JSONSchema7TypeName[];
  enum?: JSONSchema7Type[];
  const?: JSONSchema7Type;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  items?: JSONSchema7Definition | JSONSchema7Definition[];
  additionalItems?: JSONSchema7Definition;
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  contains?: JSONSchema7;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  properties?: {
    [key: string]: JSONSchema7Definition;
  };
  patternProperties?: {
    [key: string]: JSONSchema7Definition;
  };
  additionalProperties?: JSONSchema7Definition;
  dependencies?: {
    [key: string]: JSONSchema7Definition | string[];
  };
  propertyNames?: JSONSchema7Definition;
  if?: JSONSchema7Definition;
  then?: JSONSchema7Definition;
  else?: JSONSchema7Definition;
  allOf?: JSONSchema7Definition[];
  anyOf?: JSONSchema7Definition[];
  oneOf?: JSONSchema7Definition[];
  not?: JSONSchema7Definition;
  format?: string;
  contentMediaType?: string;
  contentEncoding?: string;
  definitions?: {
    [key: string]: JSONSchema7Definition;
  };
  title?: string;
  description?: string;
  default?: JSONSchema7Type;
  readOnly?: boolean;
  writeOnly?: boolean;
  examples?: JSONSchema7Type;
}
