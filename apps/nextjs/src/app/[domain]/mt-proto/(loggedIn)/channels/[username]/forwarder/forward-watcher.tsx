import { useEffect, useState } from "react";

import type { FormType } from "./ctx";
import { generateRandomString } from "~/utils/db-utils";
import { getWatcherAction, watcherActionCompleted } from "./action";
import { useForwardPageContext } from "./ctx";

interface Props {}
export function ForwarderWatchers({}: Props) {
  const ctx = useForwardPageContext();
  return (
    <div>
      {ctx.watchers?.map((watcher) => (
        <WatcherInfo key={watcher.id} watcher={watcher} />
      ))}
    </div>
  );
}
function WatcherInfo({ watcher }: { watcher: FormType["watchers"][0] }) {
  //while watcher status is in-progress,
  //get the current watcher after every 5 seconds
  async function getWatcher() {
    return await getWatcherAction(watcher.id);
  }
  // if (watcher.status === "in-progress") {
  const [wdata, setWdata] = useState(watcher);
  const [checkerId, setCheckerId] = useState<any>(null);
  useEffect(() => {
    if (checkerId) {
      getWatcherAction(wdata.id).then((result) => {
        setWdata(result);
        if (result.capturedCount == result.forwardCount) {
          watcherActionCompleted(wdata.id).then((e) => {});
        } else {
          if (result.status == "in-progress") {
            setTimeout(() => {
              setCheckerId(generateRandomString());
            }, 2000);
          }
        }
      });
    }
  }, [checkerId]);
  useEffect(() => {
    if (wdata.status == "in-progress") {
      const interval = setInterval(() => {
        getWatcher();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div>
      <p>{watcher.id}</p>
      <p>
        {/* watcher date time */}
        {watcher.forwardedAt?.toString()}
      </p>
      <div>
        {watcher.capturedCount}/{watcher.forwardCount}
      </div>
      <span>{watcher.status}</span>
    </div>
  );
}
