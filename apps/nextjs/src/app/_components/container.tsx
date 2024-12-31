"use client";

import { ScrollArea } from "@acme/ui/scroll-area";

export default function Container({ children }) {
  return <ScrollArea className="">{children}</ScrollArea>;
}
export function Section({ children }) {
  return <div className="p-4">{children}</div>;
}
