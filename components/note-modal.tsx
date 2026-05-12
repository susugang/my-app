import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

interface NoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
  initialText?: string;
  title?: string;
}

export function NoteModal({
  visible,
  onClose,
  onSave,
  initialText = "",
  title = "메모 추가",
}: NoteModalProps) {
  const [text, setText] = useState(initialText);

  const handleSave = () => {
    if (text.trim()) {
      onSave(text);
      setText("");
      onClose();
    }
  };

  const handleClose = () => {
    setText("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-black/50 justify-end"
      >
        <View className="bg-background rounded-t-3xl p-6 gap-4">
          {/* 헤더 */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-foreground">{title}</Text>
            <TouchableOpacity onPress={handleClose} className="active:opacity-70">
              <Text className="text-2xl text-muted">✕</Text>
            </TouchableOpacity>
          </View>

          {/* 텍스트 입력 */}
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="메모 내용을 입력하세요..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            className="bg-surface border border-border rounded-lg p-4 text-foreground text-base"
            style={{ textAlignVertical: "top" }}
          />

          {/* 버튼 */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 bg-surface border border-border rounded-lg py-3 active:opacity-70"
            >
              <Text className="text-foreground text-center font-semibold">취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={!text.trim()}
              className={`flex-1 rounded-lg py-3 active:opacity-80 ${
                text.trim() ? "bg-primary" : "bg-muted opacity-50"
              }`}
            >
              <Text className="text-white text-center font-semibold">저장</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
