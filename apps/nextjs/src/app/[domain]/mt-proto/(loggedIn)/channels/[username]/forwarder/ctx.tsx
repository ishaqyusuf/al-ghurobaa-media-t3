import { createContext, useContext, useEffect } from "react";

import { useFieldArray, useForm } from "@acme/ui/form";
import { toast } from "@acme/ui/toast";

import type { AsyncFn } from "~/type";
import { generateRandomString } from "~/utils/db-utils";
import { forwardUseCase, getForwarderData } from "./action";

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
  const { _meta, _count, id } = form.watch();
  const watchers = useFieldArray({
    control: form.control,
    name: "watchers",
    keyName: "uid",
  });
  async function startUploading() {
    form.setValue("_meta.forwardUid", generateRandomString());
  }

  useEffect(() => {
    if (_meta?.forwardUid && _meta?.pending) {
      console.log("FORWARDING>>");
      document.title = "Forwarding...";
      forwardUseCase({
        username,
        uid: _meta.forwardUid,
        take: _meta.forwardCount,
      }).then((r) => {
        console.log(r);

        // return;
        form.setValue("_meta.pending", _meta.pending - _meta.forwardCount);
        watchers.append({
          watcher: r.watcher as any,
          fwids: r.fwids,
        });
      });
      // }, waitSeconds * 1000);
    }
  }, [_meta?.forwardUid]);

  return {
    id,
    _meta,
    _count,
    form,
    watchers,
    startUploading,
    init,
  };
};
export const Context = createContext<
  ReturnType<typeof useCreateForwardPageContext>
>(null as any);

export const useForwardPageContext = () => useContext(Context);
