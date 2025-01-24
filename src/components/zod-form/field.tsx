import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  parseZField,
  ZField,
  zodSchemaToInnerSchema,
} from "@/components/zod-form/helpers";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/select";
import { AnyZodObject, ZodFirstPartySchemaTypes, ZodSchema } from "zod";
import { TextareaAutosizeProps } from "react-textarea-autosize";
import { Switch, SwitchProps } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { TbTrash } from "react-icons/tb";

export const ZodFieldComponent = ({
  name,
  schema,
  minRows,
  placeholder,
  label,
  onChange,
  value,
  depth = 0,
}: ZField & {
  schema: ZodFirstPartySchemaTypes;
  name: string;
  value: unknown;
  onChange: (name: string, value: unknown) => void;
  depth?: number;
}) => {
  const props = {
    key: name,
    name,
    value,
  };

  // Render different field types based on the Zod schema
  switch (schema._def.typeName) {
    case "ZodObject": {
      const { shape } = schema as AnyZodObject;
      return (
        <div className="flex gap-2 flex-col">
          {Object.entries(shape).map(([name, prop]) => {
            const propSchema = zodSchemaToInnerSchema(prop as ZodSchema);
            const zFieldProps = parseZField(prop as ZodSchema);

            const label = zFieldProps.label ?? name;

            return (
              <div key={name}>
                {label && (
                  <label className="text-xs uppercase font-medium text-stone-400 pb-1 block">
                    {label}
                  </label>
                )}
                <ZodFieldComponent
                  {...zFieldProps}
                  name={name}
                  schema={propSchema}
                  onChange={(fieldName, nextFieldValue) =>
                    onChange(name, {
                      ...(value as Record<string, unknown>),
                      [fieldName]: nextFieldValue,
                    })
                  }
                  value={
                    (value as Record<string, unknown>)[
                      name as keyof typeof value
                    ]
                  }
                  depth={depth + 1}
                />
              </div>
            );
          })}
        </div>
      );
    }
    case "ZodArray": {
      const items = Array.isArray(value) ? value : [];
      const addItem = () => {
        onChange(name, [...items, {}]);
      };

      const itemSchema = zodSchemaToInnerSchema(schema._def.type);
      return (
        <div className="flex gap-2 flex-col">
          {items.map((item, index) => (
            <div key={index} className={depth !== 0 ? "border-l-2 pl-2" : ""}>
              <div className="flex justify-between pb-2">
                <span className="text-xs text-stone-600">#{index}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-3 text-stone-600 p-0 text-xs gap-1"
                  onClick={() =>
                    onChange(
                      name,
                      items.filter((_, i) => i !== index)
                    )
                  }
                >
                  <TbTrash />
                  Remove
                </Button>
              </div>
              <ZodFieldComponent
                name={`${name}[${index}]`}
                schema={itemSchema}
                value={item}
                onChange={(_, changedItem) =>
                  onChange(
                    name,
                    items.map((item, i) => (i === index ? changedItem : item))
                  )
                }
              />
            </div>
          ))}
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            size="sm"
            onClick={addItem}
          >
            <PlusIcon className="w-4 h-4" />
            Add
          </Button>
        </div>
      );
    }
    case "ZodString":
      if (minRows) {
        return (
          <Textarea
            {...(props as TextareaAutosizeProps)}
            minRows={minRows}
            placeholder={placeholder}
            onChange={(e) => onChange(name, e.target.value)}
          />
        );
      }

      return (
        <Input
          {...(props as Omit<React.ComponentProps<"input">, "ref">)}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
        />
      );
    case "ZodBoolean":
      return (
        <Switch
          {...(props as SwitchProps)}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(name, checked)}
        />
      );

    // Add more cases for other Zod types as needed
    case "ZodEnum":
    case "ZodNativeEnum": {
      const values = schema._def.values;
      const options: Array<{ value: string; label: string }> = Array.isArray(
        values
      )
        ? schema._def.values.map((v: string) => ({
            value: v,
            label: v,
          }))
        : Object.entries(values).map(([label, value]) => ({
            label,
            value,
          }));

      return (
        <Select
          value={value as string}
          onValueChange={(value) => onChange(name, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {label && <SelectLabel>{label}</SelectLabel>}
              {options.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      );
    }
    default:
      return null;
  }
};
