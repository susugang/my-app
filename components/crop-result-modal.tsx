import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { shareCroppedImage, saveCroppedImage } from "@/lib/crop-manager";

interface CropResultModalProps {
  visible: boolean;
  imagePath?: string;
  onClose: () => void;
  onSave?: (path: string) => void;
}

export function CropResultModal({
  visible,
  imagePath,
  onClose,
  onSave,
}: CropResultModalProps) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!imagePath) return;

    try {
      setIsSaving(true);
      const timestamp = new Date().getTime();
      const fileName = `cropped_${timestamp}.png`;

      const result = await saveCroppedImage(imagePath, fileName);

      if (result.success) {
        Alert.alert("성공", result.message || "자르기된 이미지가 저장되었습니다.", [
          {
            text: "확인",
            onPress: () => {
              onSave?.(result.outputPath!);
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert("오류", result.error || "저장에 실패했습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    if (!imagePath) return;

    try {
      const success = await shareCroppedImage(imagePath);
      if (!success) {
        Alert.alert("알림", "이 기기에서는 공유를 지원하지 않습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "공유 중 오류가 발생했습니다.");
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <View className="bg-background rounded-t-3xl p-6 gap-4 max-h-96">
          {/* 헤더 */}
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xl font-bold text-foreground">자르기 완료</Text>
            <TouchableOpacity onPress={onClose} className="active:opacity-70">
              <Text className="text-2xl text-muted">✕</Text>
            </TouchableOpacity>
          </View>

          {/* 이미지 미리보기 */}
          {imagePath && (
            <ScrollView className="bg-surface rounded-lg p-4 max-h-48">
              <Image
                source={{ uri: imagePath }}
                style={{
                  width: "100%",
                  height: 200,
                  resizeMode: "contain",
                }}
              />
            </ScrollView>
          )}

          {/* 정보 */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-sm text-muted mb-2">자르기된 이미지가 준비되었습니다.</Text>
            <Text className="text-xs text-muted">
              저장하거나 다른 앱과 공유할 수 있습니다.
            </Text>
          </View>

          {/* 버튼 */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={handleShare}
              disabled={isSaving}
              className="bg-surface border border-border rounded-lg py-3 active:opacity-70"
            >
              <Text className="text-foreground text-center font-semibold">
                📤 공유
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSave}
              disabled={isSaving}
              className={`rounded-lg py-3 active:opacity-80 flex-row items-center justify-center gap-2 ${
                isSaving ? "bg-muted opacity-50" : "bg-primary"
              }`}
            >
              {isSaving && <ActivityIndicator color="white" size="small" />}
              <Text className="text-white text-center font-semibold">
                {isSaving ? "저장 중..." : "💾 저장"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              disabled={isSaving}
              className="bg-surface border border-border rounded-lg py-3 active:opacity-70"
            >
              <Text className="text-foreground text-center font-semibold">
                취소
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
