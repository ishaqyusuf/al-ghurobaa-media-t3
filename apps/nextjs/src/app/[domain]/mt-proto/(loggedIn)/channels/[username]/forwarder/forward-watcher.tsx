import { useEffect, useState } from "react";

import { Menu } from "@acme/ui/common/menu";
import { toast } from "@acme/ui/toast";

import type { FormType } from "./ctx";
import { generateRandomString } from "~/utils/db-utils";
import {
  deleteMessageForwardWatcherAction,
  getWatcherAction,
  reforwardWatcherAction,
  watcherActionCompletedAction,
} from "./action";
import { useForwardPageContext } from "./ctx";

interface Props {}
export function ForwarderWatchers({}: Props) {
  const ctx = useForwardPageContext();
  const { fields, remove } = ctx.watchers;
  return (
    <div className="flex flex-col-reverse">
      {fields?.map((watcher, index) => (
        <WatcherInfo
          index={index}
          key={watcher?.watcher?.id}
          watcher={watcher}
        />
      ))}
    </div>
  );
}
interface WatcherInfoProps {
  index?;
  watcher: FormType["watchers"][0];
}
function WatcherInfo({ watcher, index }: WatcherInfoProps) {
  const ctx = useForwardPageContext();
  const { fields, remove } = ctx.watchers;
  //while watcher status is in-progress,
  //get the current watcher after every 5 seconds
  // async function getWatcher() {
  //   return await getWatcherAction(watcher.id);
  // }
  // if (watcher.status === "in-progress") {
  const [wdata, setWdata] = useState(watcher.watcher);
  function setDocTitle(title) {
    document.title = `#W-${index}: ${title}`;
  }
  // const [watchState,setWathc]

  const [watchUid, setWatchUid] = useState(null);
  // useEffect(() => {
  //   if (watchUid) {
  //     setDocTitle("Watching...");

  //   }
  // }, [watchUid]);

  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [lastWatch, setLastWatch] = useState<any>(null);
  const [watchResult, setWatchResult] = useState("");
  useEffect(() => {
    setLastWatch(new Date());
  }, [watchResult]);
  const fetchWatcherAction = async () => {
    if (wdata.status == "completed") return;
    if (isOlderThanOneMinute()) {
      // setStatus("Watcher expired.");
      clearIntervalIfActive();
      setDocTitle("Expired");
      return;
    }
    // setStatus("checking...");
    try {
      const result = await getWatcherAction(wdata.id);
      setWdata(result as any);
      let wResult = `${result.capturedCount}/${result.forwardCount}`;
      if (wResult != watchResult) {
        console.log({ wResult, watchResult });
        setWatchResult(wResult);
        setDocTitle(`Watching | ${wResult}`);
      }
      if (result.capturedCount === result.forwardCount) {
        clearIntervalIfActive();
        await watcherActionCompleted();
        // setStatus("Completed");
        toast.success("Watch Batch completed.");
        setDocTitle("Complete!");
        // ctx.startUploading();
      } else if (result.status !== "in-progress") {
        clearIntervalIfActive();
      }
    } catch (error) {
      console.error("Error fetching watcher action:", error);
      clearIntervalIfActive();
    }
  };

  const clearIntervalIfActive = () => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  };
  const isOlderThanOneMinute = (): boolean => {
    let createdAt = lastWatch;
    console.log({ lastWatch });
    if (!createdAt) return false;
    const createdAtTime = createdAt.getTime();
    const currentTime = Date.now();
    return currentTime - createdAtTime > 60 * 1000; // 1 minute in milliseconds
  };

  useEffect(() => {
    if (wdata.status === "in-progress" && !intervalId) {
      if (wdata.forwardCount == wdata.capturedCount) {
        watcherActionCompleted().then((e) => {
          setDocTitle("Complete!");
        });
      } else startWatcher();
    }

    return () => {
      clearIntervalIfActive();
    };
  }, [wdata.status]);
  const startWatcher = () => {
    if (!intervalId) {
      const id = setInterval(() => {
        fetchWatcherAction();
      }, 5000);
      setIntervalId(id);
    }
  };
  async function deleteWatcher() {
    await deleteMessageForwardWatcherAction(wdata.id);
    remove(index);
  }
  const stopWatcher = () => {
    clearIntervalIfActive();
    // setStatus("Watcher stopped.");
  };
  async function reforward() {
    try {
      const resp = await reforwardWatcherAction(wdata.id);
      setWdata(resp.watcher as any);
      // setStatus("Restarting watcher...");
      startWatcher(); // Restart the watcher after reforward action
    } catch (error) {
      console.error("Error restarting watcher:", error);
      toast.error("Failed to restart watcher.");
    }
  }
  async function watcherActionCompleted() {
    await watcherActionCompletedAction(wdata.id);
    const wa = await getWatcherAction(wdata.id);
    console.log(wa);
    setWdata(wa as any);
  }
  return (
    <div className="flex gap-4 border-b text-sm">
      <div className="">{index + 1}.</div>
      <div>
        <p>{wdata.id}</p>
        <p>{wdata.forwardedAt?.toDateString()}</p>
      </div>
      <div className="flex-1"></div>
      <div>
        <div>
          {wdata.capturedCount}/{wdata.forwardCount}
        </div>
        <span>{status || wdata.status}</span>
      </div>
      <Menu>
        <Menu.Item onClick={reforward}>Reforward</Menu.Item>
        <Menu.Item onClick={watcherActionCompleted}>Completed</Menu.Item>
        <Menu.Item onClick={deleteWatcher}>Delete</Menu.Item>
      </Menu>
    </div>
  );
}
