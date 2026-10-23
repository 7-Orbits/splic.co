import type { ComponentProps, ReactNode } from "react";

interface FormFieldProps {
  label: string;
  hint?: ReactNode;
  error?: string;
  id: string;
}

type InputFieldProps = FormFieldProps &
  Omit<ComponentProps<"input">, "id" | "className"> & {
    variant?: "input";
  };

type TextareaFieldProps = FormFieldProps &
  Omit<ComponentProps<"textarea">, "id" | "className"> & {
    variant: "textarea";
  };

export type FormFieldComponentProps = InputFieldProps | TextareaFieldProps;

export function FormField(props: FormFieldComponentProps) {
  const { label, hint, error, id, variant = "input", ...rest } = props;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  const shared = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className:
      "glass-field mt-2 w-full rounded-md px-3 py-2 text-md text-text-primary",
  } as const;

  return (
    <div>
      <label htmlFor={id} className="text-md font-medium text-text-primary">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="mt-1 text-sm text-text-tertiary">
          {hint}
        </p>
      ) : null}
      {variant === "textarea" ? (
        <textarea {...shared} {...(rest as ComponentProps<"textarea">)} />
      ) : (
        <input {...shared} {...(rest as ComponentProps<"input">)} />
      )}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-sm text-accent-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
