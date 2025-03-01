import { ReactNode } from "react";
import { FieldPath, FieldPathValue } from "react-hook-form";
import { create } from "zustand";

import { dotSet } from "~/utils/utils";

type SnapPoints =
  | "30%"
  | "40%"
  | "50%"
  | "60%"
  | "70%"
  | "80%"
  | "90%"
  | "100%";
const data = {
  opened: false,
  content: null as ReactNode | null,
  loading: false,
  startTransition: null,
  snapPoints: null as any as SnapPoints[],
  noBackDrop: false,
};
export interface OpenProps {
  content: ReactNode | null;
  snapPoints?: SnapPoints[];
  noBackDrop?: boolean;
}
type Action = ReturnType<typeof funcs>;
type Data = typeof data;
type SheetStore = Data & Action;
export type ZusFormSet = (update: (state: Data) => Partial<Data>) => void;

function funcs(set: ZusFormSet) {
  return {
    openSheet: (data: OpenProps) =>
      set((state) => {
        return {
          ...state,
          ...data,
          opened: true,
          loading: false,
          startTransition: null,
          snapPoints: data.snapPoints || ["30%", "70%", "100%"],
        };
      }),
    closeModal: () =>
      set((state) => ({
        ...state,
        opened: false,
      })),
    dotUpdate: <K extends FieldPath<Data>>(k: K, v: FieldPathValue<Data, K>) =>
      set((state) => {
        const newState = {
          ...state,
        };
        const d = dotSet(newState);
        d.set(k, v);
        return newState;
      }),
  };
}
export const sheetStore = create<SheetStore>((set) => ({
  ...data,
  ...funcs(set),
}));
