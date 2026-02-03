import { Color } from "@theme/color";
import React from "react";
import { View, FlatList, TouchableOpacity, Text, StyleSheet, Modal, Pressable } from "react-native";

// Type for items that can have different name properties
type BottomSheetItem = string | {
  category_name?: string;
  name?: string;
  position_name?: string;
  activity_name?: string;
};
 
interface DropdownModalProps {
  visible: boolean;
  options?: BottomSheetItem[];
  onClose: () => void;
  onSelect: (item: BottomSheetItem) => void;
}

const BottomSheet: React.FC<DropdownModalProps> = ({ visible, options, onClose, onSelect }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modalContainer}>
          <View style={styles.handle} />
          <FlatList
            showsVerticalScrollIndicator={false}
            data={options}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }: { item: BottomSheetItem }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text allowFontScaling={false} style={styles.optionText}>
                  {typeof item === 'string' 
                    ? item 
                    : item?.category_name || item?.name || item?.position_name || item?.activity_name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  modalContainer: {
    backgroundColor: "rgba(45, 45, 46, 1)",
    paddingVertical: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 15,
  },
  handle: {
    width: 20,
    height: 3,
    borderRadius: 10,
    alignSelf: "center",
  },
  option: {
    padding: 5,
    justifyContent: "center"
  },
  optionText: {
    fontSize: 16,
    color:   Color.whiteText,
    fontWeight: "400",
    marginBottom: 2,

  },
  closeButton: {
    marginTop: 15,
    padding: 13,
    backgroundColor: Color.background,
    borderRadius: 15,
    alignItems: "center",
  },
  closeButtonText: {
    color:  Color.whiteText,
    fontWeight: "600",
    fontSize: 16,
  },
});

export default BottomSheet;
