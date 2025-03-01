import { Dispatch, SetStateAction, useCallback, useMemo, useRef } from "react";
import BottomSheet, {
  BottomSheetBackdrop,
  useGestureEventsHandlersDefault,
} from "@gorhom/bottom-sheet";

import { sheetStore } from "./store";

interface BaseSheetProps {
  children;
}
function BaseSheet({ children }: BaseSheetProps) {
  const store = sheetStore();
  const handleSheetChanges = useCallback((index) => {
    if (index == -1) {
      store.closeModal();
      bottomSheetRef.current?.close();
    }
  }, []);
  //   const snapPoints = useMemo(() => ["30%", "50%", "90%"], []);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={1}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={store.snapPoints}
      enableDynamicSizing={false}
      backdropComponent={store.noBackDrop ? undefined : renderBackdrop}
      backgroundStyle={{ backgroundColor: "black" }}
      onChange={handleSheetChanges}
    >
      {children}
    </BottomSheet>
  );
}

export default Object.assign(BaseSheet, {});
