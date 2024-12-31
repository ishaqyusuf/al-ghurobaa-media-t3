import { forwardRef, useImperativeHandle, useState } from "react";
import Link from "next/link";
import { DropdownMenuItemProps } from "@radix-ui/react-dropdown-menu";
import { VariantProps } from "class-variance-authority";

import { cn } from "..";
import { Button, buttonVariants } from "../button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { ScrollArea } from "../scroll-area";
import { PrimitiveDivProps } from "../type";
import { IconKeys, Icons } from "./icons";

type MenuItemProps = {
  link?;
  href?;
  Icon?;
  SubMenu?;
  shortCut?;
  _blank?: Boolean;
  icon?: IconKeys;
} & DropdownMenuItemProps;
interface RowActionMoreMenuProps {
  children;
  disabled?: boolean;
  label?;
  Icon?;
  Trigger?;
  noSize?: boolean;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  triggerSize?: VariantProps<typeof buttonVariants>["size"];
  open?;
  onOpenChanged?;
}
function BaseMenu(
  {
    children,
    Icon = Icons.Menu,
    label,
    disabled,
    Trigger,
    noSize,
    open,
    onOpenChanged,
    triggerSize,
    variant = "outline",
  }: RowActionMoreMenuProps,
  ref,
) {
  const [_open, _onOpenChanged] = useState(open);
  useImperativeHandle(ref, () => ({
    _onOpenChanged,
  }));
  return (
    <DropdownMenu
      open={onOpenChanged ? open : _open}
      onOpenChange={(e) => {
        _onOpenChanged(e);
        onOpenChanged?.(e);
      }}
    >
      <DropdownMenuTrigger asChild>
        {Trigger ? (
          Trigger
        ) : (
          <Button
            disabled={disabled}
            variant={variant}
            className={cn(
              "flex h-8 space-x-4",
              !label && "w-8 p-0",
              variant == "primary"
                ? "data-[state=open]:bg-muted-foreground"
                : "data-[state=open]:bg-muted",
              triggerSize == "sm" && "h-6 w-6",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {label && <span className="">{label}</span>}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn(!noSize && "w-[185px]")}>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
function Item({
  link,
  href,
  children,
  Icon,
  SubMenu,
  onClick,
  _blank,
  icon,
  shortCut,
  ...props
}: MenuItemProps) {
  if (!Icon && icon) Icon = Icons[icon];
  if (SubMenu)
    return (
      <DropdownMenuSub {...props}>
        <DropdownMenuSubTrigger>
          {Icon && (
            <Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          )}
          {children}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <ScrollArea className="max-h-[50vh] overflow-auto">
            {SubMenu}
          </ScrollArea>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  const Frag = () => (
    <DropdownMenuItem
      {...props}
      onClick={link || href ? null : (onClick as any)}
    >
      {Icon && <Icon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />}
      {children}
      {!!shortCut && (
        <DropdownMenuShortcut className="ml-6">{shortCut}</DropdownMenuShortcut>
      )}
    </DropdownMenuItem>
  );
  if (link || href)
    return (
      <LinkableNode _blank={_blank} href={link || href}>
        <Frag />
      </LinkableNode>
    );
  return <Frag />;
}
function LinkableNode({
  href,
  As,
  children,
  _blank,
  ...props
}: PrimitiveDivProps & { href?; className?; As?; _blank?: Boolean }) {
  if (href)
    return (
      <Link
        {...(props as any)}
        className={cn("hover:underline", props?.className)}
        target={_blank && "_blank"}
        href={href}
      >
        {children}
      </Link>
    );
  return <div {...props}>{children}</div>;
}
export let Menu = Object.assign(forwardRef(BaseMenu), {
  Item,
  Label: DropdownMenuLabel,
  Separator: DropdownMenuSeparator,
});
