import type { ControllerProps, FieldPath, FieldValues } from "react-hook-form";

import { cn } from "@acme/ui";

import { Button } from "./button";
import { FormControl, FormField, FormItem, FormLabel } from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";

interface Props<T> {
  label?: string;
  placeholder?: string;
  className?: string;
  suffix?: string;
  type?: string;
  list?: boolean;
  size?: "sm" | "default" | "xs";
  prefix?: string;
  // defaultValue?:boolean
}
export default function InputControl<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
  TOptionType = any,
>({
  label,
  placeholder,
  className,
  suffix,
  type,
  list,
  prefix,
  size = "default",
  ...props
}: Partial<ControllerProps<TFieldValues, TName>> & Props<TOptionType>) {
  return (
    <FormField
      {...(props as any)}
      render={({ field, fieldState }) => (
        <FormItem className={cn(className, "mx-1")}>
          {label && (
            <FormLabel className={cn(fieldState.error && "border-red-400")}>
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div
              className={cn(
                (suffix || prefix) && "flex items-center space-x-1",
                "",
              )}
            >
              {prefix && (
                <Button
                  type="button"
                  size={size as any}
                  variant={"outline"}
                  className={cn(size == "sm" && "h-8")}
                >
                  {prefix}
                </Button>
              )}
              {type == "textarea" ? (
                <Textarea
                  placeholder={placeholder}
                  className={cn(fieldState.error && "border-red-400")}
                  {...(list
                    ? {
                        defaultValue: field.value,
                        onChange: field.onChange,
                      }
                    : field)}
                  // value={""}
                />
              ) : (
                <Input
                  type={type}
                  placeholder={placeholder}
                  // {...field}
                  // value={""}
                  className={cn(
                    fieldState.error && "border-red-400",
                    size == "sm" && "h-8",
                  )}
                  {...(list
                    ? {
                        defaultValue: field.value,
                        //   onChange: field.onChange,
                      }
                    : field)}
                  // onChange={field.onChange}
                  // defaultValue={field.value}
                  onChange={(e) => {
                    if (type == "number")
                      e.target.value
                        ? field.onChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        : field.onChange(null);
                    else field.onChange(e);
                  }}
                />
              )}
              {suffix && (
                <Button
                  type="button"
                  size={size as any}
                  variant={"outline"}
                  className={cn(size == "sm" && "h-8")}
                >
                  {suffix}
                </Button>
              )}
            </div>
          </FormControl>
        </FormItem>
      )}
    />
  );
}
