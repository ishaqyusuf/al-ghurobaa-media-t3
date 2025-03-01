import { Text as BaseText, TextStyle } from "react-native";
import { MoreOrLess } from "react-native-more-or-less-text";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "../cn";

const textVariants = cva(
  //   "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  "",
  {
    variants: {
      variant: {
        default: "text-white",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "text-base",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xs: "h-8 rounded-md px-2",
        icon: "h-9 w-9",
        "icon-md": "size-11",
        "icon-lg": "size-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  },
);
export interface TextProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof textVariants> {
  className?: string;
  children?: React.ReactNode;
  truncate?;
  textStyle?: TextStyle;
}
export default function Text({
  children,
  className,
  truncate,
  textStyle,
  ...props
}: TextProps) {
  if (truncate)
    return (
      <MoreOrLess
        numberOfLines={truncate}
        textStyle={{
          color: props.variant == "default" ? "white" : "gray",
          fontSize: props.size == "default" ? 12 : 15,
          fontWeight: "bold",
          textAlign: "right",
          ...(textStyle || {}),
        }}
      >
        {children as string}
      </MoreOrLess>
    );
  return (
    <BaseText className={cn(textVariants(props), className)}>
      {children}
    </BaseText>
  );
}
