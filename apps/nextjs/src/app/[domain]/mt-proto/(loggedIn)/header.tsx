"use client";

import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/toast";

import { clearBlogsAction } from "~/data-access/blog.dta";
import { logoutAction } from "../lib/action";

export default function Header() {
  async function logout() {
    await logoutAction();
  }
  async function clearBlogs() {
    await clearBlogsAction();
    toast.success("Cleared");
  }
  return (
    <div className="flex justify-end">
      <Button onClick={clearBlogs} size="xs">
        Clear Blogs
      </Button>
      <Button onClick={logout} size="xs">
        Logout
      </Button>
    </div>
  );
}
