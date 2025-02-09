import { ZodFieldComponent } from "@/components/zod-form/field";
import { zodSchemaToInnerSchema } from "@/components/zod-form/helpers";
import { cx } from "class-variance-authority";
import React, { useMemo, useState } from "react";
import { z, ZodSchema } from "zod";

interface FormProps<T extends ZodSchema> {
  schema: T;
  initialValues?: z.infer<T>;
  onChange?: (values: z.infer<T>) => void;
  className?: string;
  children?: React.ReactNode;
  onSubmit?: (values: z.infer<T>) => void;
}

export const ZodForm = React.memo(
  <T extends ZodSchema>({
    schema: rootSchema,
    initialValues,
    onChange,
    className,
    children,
    onSubmit,
    ...props
  }: FormProps<T>) => {
    // I will fake a form implementation here
    // in prod one is better suited with react-final-form or other form lib
    // but for this challenge it's enough
    const [values, setValues] = useState(initialValues || {});
    const handleChange = (_: string, value: z.infer<T>) => {
      setValues(value);
      onChange?.(value);
    };
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit?.(values);
    };

    const schema = useMemo(
      () => zodSchemaToInnerSchema(rootSchema),
      [rootSchema]
    );

    return (
      <form {...props} onSubmit={handleSubmit} className={cx("", className)}>
        <ZodFieldComponent
          name=""
          schema={schema}
          onChange={handleChange}
          value={values}
        />
        {children}
      </form>
    );
  }
);
