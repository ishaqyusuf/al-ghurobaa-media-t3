import React from "react";
import { Text, TouchableOpacity, Vibration } from "react-native";
import { cva, VariantProps } from "class-variance-authority";

import { cn } from "../cn";
import { Icon, Icons } from "../icon";

const buttonVariants = cva(
  //   "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  "",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
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
        default: "h-10 px-4 py-2",
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
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  icon?: Icons;
  //   title: string;
  onPress: () => void;
  onLongPress?: () => void;
  //   variant?: "primary" | "secondary" | "danger";
  ripple?: boolean;
  className?: string;
  children?: React.ReactNode;
  iconSize?: number;
  iconColor?: string;
}

const Button: React.FC<ButtonProps> = (props) => {
  const {
    onPress,
    onLongPress,
    ripple = true,
    children,
    className,
    iconSize = 20,
    iconColor = "white",
    icon,
    ...restProps
  } = props;
  const handlePress = () => {
    if (ripple) {
      // Add ripple effect logic here
    }
    Vibration.vibrate(20);
    onPress();
  };

  const handleLongPress = () => {
    if (onLongPress) {
      Vibration.vibrate(100);
      onLongPress();
    }
  };

  return (
    <TouchableOpacity
      className={cn(
        "items-center justify-center rounded p-2",
        className,
        buttonVariants(restProps as any),
      )}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {typeof children === "string" ? (
        <Text className="text-lg text-white">{children}</Text>
      ) : (
        children
      )}
      {icon && <Icon icon={icon} size={iconSize} color={iconColor} />}
    </TouchableOpacity>
  );
};

export default Button;
