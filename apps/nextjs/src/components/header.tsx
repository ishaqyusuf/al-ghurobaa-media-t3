"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { cn } from "@acme/ui";
import { buttonVariants } from "@acme/ui/button";
import Button from "@acme/ui/common/button";
import { Icons } from "@acme/ui/common/icons";
import { Menu } from "@acme/ui/common/menu";
import { TextWithTooltip } from "@acme/ui/common/text-with-tooltip";
import { Label } from "@acme/ui/label";
import { PortalNode } from "@acme/ui/portal";

import { logoutAction } from "~/app/[domain]/mt-proto/lib/action";

interface Props {
  back?: string;
  title?;
  Actions?;
  children?;
}
export default function Header({ back, children, title, Actions }: Props) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setShow(true);
    }, 2000);
  }, []);
  if (!show) return null;
  return (
    <PortalNode container={document.getElementById("appHeader")}>
      <div className="flex h-12 items-center gap-4 border-b bg-muted-foreground/10 px-4 shadow-xl">
        {back && (
          <Link
            className={cn(
              buttonVariants({
                size: "sm",
                variant: "outline",
              }),
              "px-2",
            )}
            href={back}
          >
            <Icons.arrowLeft className="size-4" />
          </Link>
        )}
        <Label>
          <TextWithTooltip text={title} />
        </Label>
        <div className="flex-1" />
        {children}
        <Menu>
          {Actions}
          <Menu.Item href={`mt-proto/channels`}>Home</Menu.Item>
          <Menu.Item
            onClick={async () => {
              await logoutAction();
            }}
          >
            Logout
          </Menu.Item>
        </Menu>
      </div>
    </PortalNode>
  );
}
