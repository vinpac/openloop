import { ZodFirstPartySchemaTypes, ZodSchema, ZodType } from "zod";

export type ZField = {
  label?: string;
  placeholder?: string;
  minRows?: number;
};

export function zField<T extends ZodFirstPartySchemaTypes>(
  schema: T,
  field: ZField
): T {
  return schema.describe(JSON.stringify(field)) as T;
}
export const zodSchemaToInnerSchema = (f: ZodSchema) => {
  let fieldInnerSchema = f as ZodFirstPartySchemaTypes;

  while (
    fieldInnerSchema._def.typeName === "ZodOptional" ||
    fieldInnerSchema._def.typeName === "ZodDefault"
  ) {
    fieldInnerSchema = fieldInnerSchema._def.innerType;
  }

  return fieldInnerSchema;
};

export const parseZField = (schema: ZodType): ZField => {
  try {
    return JSON.parse(schema.description || "{}") as ZField;
  } catch (e) {
    return {};
  }
};
