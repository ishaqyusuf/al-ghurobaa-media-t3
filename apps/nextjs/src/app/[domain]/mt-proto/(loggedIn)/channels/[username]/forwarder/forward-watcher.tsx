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
    <div>
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
  const [status, setStatus] = useState(watcher?.watcher?.status);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const fetchWatcherAction = async () => {
    if (isOlderThanOneMinute(wdata.forwardedAt as any) || !status) {
      setStatus("Watcher expired.");
      clearIntervalIfActive();
      return;
    }
    setStatus("checking...");
    try {
      const result = await getWatcherAction(wdata.id);
      setWdata(result);
      console.log(result);

      if (result.capturedCount === result.forwardCount) {
        clearIntervalIfActive();
        await watcherActionCompleted();
        setStatus(null);
        toast.success("Watch Batch completed.");
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
  const isOlderThanOneMinute = (createdAt: string): boolean => {
    const createdAtTime = new Date(createdAt).getTime();
    const currentTime = Date.now();
    return currentTime - createdAtTime > 60 * 1000; // 1 minute in milliseconds
  };

  useEffect(() => {
    if (wdata.status === "in-progress" && !intervalId) {
      startWatcher();
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
    setStatus("Watcher stopped.");
  };
  async function reforward() {
    try {
      const resp = await reforwardWatcherAction(wdata.id);
      setWdata(resp.watcher);
      setStatus("Restarting watcher...");
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
    setWdata(wa);
  }
  return (
    <div className="flex gap-4 border-b text-sm">
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
