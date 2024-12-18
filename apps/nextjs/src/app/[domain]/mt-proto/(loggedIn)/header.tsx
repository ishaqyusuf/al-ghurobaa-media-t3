"use client";

import { Button } from "@acme/ui/button";

import { logoutAction } from "../lib/action";

export default function Header({}) {
  async function logout() {
    await logoutAction();
  }
  return (
    <div className="flex justify-end">
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
