import _dotObject from "dot-object";
import { FieldPath, FieldPathValue } from "react-hook-form";

// Format file size (e.g., 1.23 MB)
export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// Format audio duration (e.g., 3:45 for 3 minutes and 45 seconds)
export const formatDuration = (millis) => {
  const totalSeconds = Math.floor(millis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};
export const isRTL = (text: string) => {
  const rtlChars = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/; // Unicode range for RTL characters
  return rtlChars.test(text);
};
export const dotObject = _dotObject;
export function dotSet<T>(object: T) {
  // Cast to `any` since dotObject doesn't support TS inference
  return {
    set(key: FieldPath<T>, value?: FieldPathValue<T, typeof key>) {
      dotObject.set(key, value, object as any);
    },
  };
}
