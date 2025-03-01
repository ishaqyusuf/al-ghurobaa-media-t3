"use client";

import {
  createContext,
  Fragment,
  ReactNode,
  useContext,
  useState,
  useTransition,
} from "react";
import { Text, View } from "react-native";

import Sheet from ".";
import { OpenProps, sheetStore } from "./store";

export interface ModalContextProps {
  //   openModal: (content: ReactNode, type?: ModalType) => void;
  //   openSheet: (content: ReactNode, type?: ModalType) => void;
  //   close: (callBack?) => void;
  //   data: DataType;
  //   opened?: boolean;
  //   setShowModal;
  loading;
  startTransition;
  open(props: OpenProps);
  close;
}
export type ModalType = "modal" | "sheet";
const ModalContext = createContext<ModalContextProps | undefined>(undefined);
type DataType = { type?: ModalType; _data? };

function fn() {
  throw new Error("Modal Context not initialized");
}

const modalUtil: ModalContextProps = {
  //   openModal: fn,
  //   openSheet: fn,
  //   close: fn,
  //   setShowModal: null,
  loading: false,
  startTransition: null,
  open: null as any,
  close: null as any,
};
export function SheetProvider({ children }: { children: ReactNode }) {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const store = sheetStore();
  const [loading, startTransition] = useTransition();
  const show = (props: OpenProps) => {
    //   const show = (content: ReactNode, type: ModalType = "modal", extras = {}) => {

    setModalContent(props.content);
    // store.dotUpdate("opened", true);
    store.openSheet(props);
    console.log("OPENED");
    console.log({ store });
  };

  const close = (callBack?) => {
    store.dotUpdate("opened", false);
    setTimeout(() => {
      setModalContent(null);
      callBack && callBack();
      // document.body.style.pointerEvents = "";
      store.closeModal();
    }, 1000); // Adjust this timeout as per your transition duration
  };
  const value = {
    loading,
    startTransition,
    close,
    open: show,
    // openModal(content: ReactNode, extras: any = {}) {
    //   show(content, "modal", extras);
    // },
    // openSheet(content: ReactNode, extras: any = {}) {
    //   show(content, "sheet", extras);
    // },
  };
  Object.keys(value).map((k) => {
    modalUtil[k] = value[k];
  });

  return (
    <ModalContext.Provider value={value}>
      {children}
      {store.opened && (
        <Fragment>
          <Sheet>{store.content}</Sheet>
        </Fragment>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  // if (modalUtil.openModal) return _modal;
  const context = useContext<ModalContextProps>(ModalContext as any);
  if (!context) throw new Error("useModal must be within a ModalProvider");
  return context;
}
export const _sheet = modalUtil;
