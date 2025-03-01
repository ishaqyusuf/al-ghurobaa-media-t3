import { FieldPath, FieldPathValue } from "react-hook-form";
import { create } from "zustand";

import { BlogPost } from "~/components/type";
import { dotSet } from "~/utils/utils";

type StoreActions = ReturnType<typeof funcs>;
type StoreData = typeof initialState;
export type Store = StoreData & StoreActions;

type StoreSet = (update: (state: StoreData) => Partial<StoreData>) => void;
function funcs(set: StoreSet) {
  return {
    _: (data) => set((state) => ({ ...state, ...data })),
    dotUpdate: <K extends FieldPath<StoreData>>(
      key: K,
      value: FieldPathValue<StoreData, K>,
    ) =>
      set((state) => {
        console.log("updating: ", key);
        const newState = {
          ...state,
        };
        const dot = dotSet(newState);
        dot.set(key, value);
        return newState;
      }),
  };
}
const initialState = {
  blogMenu: null as any as BlogPost,
  sheetOpened: false,
  menuType: null as any as "batchSelect" | "blogMenu",
  blogs: [] as BlogPost[],
  selection: {
    items: {} as { [id in string]: Boolean },
    count: 0,
  },
};
export const useStore = create<Store>((set) => ({
  ...initialState,
  ...funcs(set),
}));
