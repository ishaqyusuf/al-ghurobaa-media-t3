import React, { useCallback, useState } from "react";
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";

const screenHeight = Dimensions.get("window").height;

// Hook to use modal
export const useModal = () => {
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(
    null,
  );
  const [isSheet, setIsSheet] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const open = useCallback((content: React.ReactNode) => {
    setModalContent(content);
    setIsSheet(false); // Regular modal
    setIsVisible(true);
  }, []);

  const openSheet = useCallback((content: React.ReactNode) => {
    setModalContent(content);
    setIsSheet(true); // Open as a bottom sheet
    setIsVisible(true);
  }, []);

  const close = useCallback(() => {
    setIsVisible(false);
    setModalContent(null);
  }, []);

  const ModalComponent = useCallback(
    () => (
      <Modal
        visible={isVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={close}
      >
        <View className="sbg-black flex-1 items-center justify-center">
          <TouchableOpacity className="absolute inset-0" onPress={close} />
          <View
            className={`${
              isSheet ? "h-[40%] w-full rounded-t-2xl" : "w-4/5 rounded-xl"
            } bg-white p-6`}
          >
            <TouchableOpacity className="mb-2 self-end" onPress={close}>
              <Text className="text-lg text-red-500">Close</Text>
            </TouchableOpacity>
            {modalContent}
          </View>
        </View>
      </Modal>
    ),
    [isVisible, modalContent, isSheet, close],
  );

  return { open, openSheet, close, ModalComponent };
};
