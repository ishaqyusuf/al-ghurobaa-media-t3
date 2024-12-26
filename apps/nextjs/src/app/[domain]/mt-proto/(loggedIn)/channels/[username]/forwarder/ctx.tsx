import { createContext, useContext, useEffect } from "react";

import { useForm } from "@acme/ui/form";
import { toast } from "@acme/ui/toast";

import type { AsyncFn } from "~/type";
import { generateRandomString } from "~/utils/db-utils";
import { forward, getForwarderData } from "./action";

export type FormType = AsyncFn<typeof getForwarderData>;

export const useCreateForwardPageContext = (username) => {
  const defaultValues: FormType = null as any;
  const form = useForm({
    defaultValues,
  });
  async function init() {
    getForwarderData(username)
      .then((res) => {
        form.reset(res);
      })
      .catch((e) => {
        console.error(e);
        toast.error("Error fetching data");
      });
  }
  useEffect(() => {
    init();
  }, []);
  const { _meta, _count, id, ...rest } = form.watch();
  async function startUploading() {
    form.setValue("_meta.forwardUid", generateRandomString());
  }
  useEffect(() => {
    if (_meta?.forwardUid && _meta?.pending) {
      const date = new Date();

      const fwd = forward({
        username,
        uid: _meta.forwardUid,
        take: _meta.forwardCount,
      }).then((r) => {
        form.setValue("_meta.pending", _meta.pending - _meta.forwardCount);
      });
      // }, waitSeconds * 1000);
    }
  }, [_meta?.forwardUid, _meta?.pending, _meta?.forwardCount, username, form]);

  return {
    id,
    _meta,
    _count,
    form,
    ...rest,
    startUploading,
  };
};
export const Context = createContext<
  ReturnType<typeof useCreateForwardPageContext>
>(null as any);

export const useForwardPageContext = () => useContext(Context);
