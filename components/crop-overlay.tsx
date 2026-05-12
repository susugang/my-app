import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  PanResponder,
  StyleSheet,
} from "react-native";
import { CropArea, normalizeCropArea } from "@/lib/crop-manager";

interface CropOverlayProps {
  visible: boolean;
  onCrop: (cropArea: CropArea) => void;
  onCancel: () => void;
  containerWidth?: number;
  containerHeight?: number;
}

export function CropOverlay({
  visible,
  onCrop,
  onCancel,
  containerWidth = 300,
  containerHeight = 400,
}: CropOverlayProps) {
  const [cropArea, setCropArea] = useState<CropArea>({
    x: containerWidth * 0.1,
    y: containerHeight * 0.1,
    width: containerWidth * 0.8,
    height: containerHeight * 0.8,
  });

  // To keep track of the initial position during a gesture
  const startAreaRef = useRef<CropArea>({ ...cropArea });

  // 1. Move entire crop box
  const panResponderMove = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startAreaRef.current = { ...cropArea };
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        let newArea = {
          ...startAreaRef.current,
          x: startAreaRef.current.x + dx,
          y: startAreaRef.current.y + dy,
        };
        setCropArea(normalizeCropArea(newArea, containerWidth, containerHeight));
      },
    })
  ).current;

  // 2. Corner Resizing (Top-Left, Top-Right, Bottom-Left, Bottom-Right)
  const createResizeResponder = (corner: "tl" | "tr" | "bl" | "br") => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startAreaRef.current = { ...cropArea };
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx, dy } = gestureState;
        const start = startAreaRef.current;
        let newArea = { ...start };

        const MIN_SIZE = 50;

        if (corner === "tl") {
          newArea.x = Math.min(start.x + dx, start.x + start.width - MIN_SIZE);
          newArea.y = Math.min(start.y + dy, start.y + start.height - MIN_SIZE);
          newArea.width = start.width - (newArea.x - start.x);
          newArea.height = start.height - (newArea.y - start.y);
        } else if (corner === "tr") {
          newArea.y = Math.min(start.y + dy, start.y + start.height - MIN_SIZE);
          newArea.width = Math.max(MIN_SIZE, start.width + dx);
          newArea.height = start.height - (newArea.y - start.y);
        } else if (corner === "bl") {
          newArea.x = Math.min(start.x + dx, start.x + start.width - MIN_SIZE);
          newArea.width = start.width - (newArea.x - start.x);
          newArea.height = Math.max(MIN_SIZE, start.height + dy);
        } else if (corner === "br") {
          newArea.width = Math.max(MIN_SIZE, start.width + dx);
          newArea.height = Math.max(MIN_SIZE, start.height + dy);
        }

        setCropArea(normalizeCropArea(newArea, containerWidth, containerHeight));
      },
    });
  };

  const panResponderTL = useRef(createResizeResponder("tl")).current;
  const panResponderTR = useRef(createResizeResponder("tr")).current;
  const panResponderBL = useRef(createResizeResponder("bl")).current;
  const panResponderBR = useRef(createResizeResponder("br")).current;

  if (!visible) return null;

  const handleCrop = () => {
    onCrop(cropArea);
  };

  const HANDLE_SIZE = 30;

  return (
    <View className="absolute inset-0 bg-black/50 flex items-center justify-center">
      {/* 자르기 컨테이너 */}
      <View
        className="bg-background rounded-lg overflow-hidden border-2 border-primary relative"
        style={{
          width: containerWidth,
          height: containerHeight,
        }}
      >
        {/* 어두운 오버레이 (선택되지 않은 영역) */}
        {/* 상단 */}
        <View
          className="absolute bg-black/70"
          style={{
            left: 0,
            top: 0,
            width: containerWidth,
            height: cropArea.y,
          }}
        />

        {/* 하단 */}
        <View
          className="absolute bg-black/70"
          style={{
            left: 0,
            top: cropArea.y + cropArea.height,
            width: containerWidth,
            height: containerHeight - (cropArea.y + cropArea.height),
          }}
        />

        {/* 좌측 */}
        <View
          className="absolute bg-black/70"
          style={{
            left: 0,
            top: cropArea.y,
            width: cropArea.x,
            height: cropArea.height,
          }}
        />

        {/* 우측 */}
        <View
          className="absolute bg-black/70"
          style={{
            left: cropArea.x + cropArea.width,
            top: cropArea.y,
            width: containerWidth - (cropArea.x + cropArea.width),
            height: cropArea.height,
          }}
        />

        {/* 자르기 영역 표시 */}
        <View
          className="absolute border-2 border-primary bg-transparent"
          style={{
            left: cropArea.x,
            top: cropArea.y,
            width: cropArea.width,
            height: cropArea.height,
          }}
          {...panResponderMove.panHandlers}
        >
          {/* 좌상단 핸들 */}
          <View
            className="absolute bg-primary rounded-full items-center justify-center shadow-sm"
            style={{
              left: -HANDLE_SIZE / 2,
              top: -HANDLE_SIZE / 2,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
            }}
            {...panResponderTL.panHandlers}
          />

          {/* 우상단 핸들 */}
          <View
            className="absolute bg-primary rounded-full items-center justify-center shadow-sm"
            style={{
              right: -HANDLE_SIZE / 2,
              top: -HANDLE_SIZE / 2,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
            }}
            {...panResponderTR.panHandlers}
          />

          {/* 좌하단 핸들 */}
          <View
            className="absolute bg-primary rounded-full items-center justify-center shadow-sm"
            style={{
              left: -HANDLE_SIZE / 2,
              bottom: -HANDLE_SIZE / 2,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
            }}
            {...panResponderBL.panHandlers}
          />

          {/* 우하단 핸들 */}
          <View
            className="absolute bg-primary rounded-full items-center justify-center shadow-sm"
            style={{
              right: -HANDLE_SIZE / 2,
              bottom: -HANDLE_SIZE / 2,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
            }}
            {...panResponderBR.panHandlers}
          />
        </View>
      </View>

      {/* 정보 텍스트 */}
      <View className="mt-4 items-center gap-2">
        <Text className="text-foreground text-sm">
          크기: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}
        </Text>
        <Text className="text-muted text-xs">
          핸들을 드래그하여 자르기 영역을 조정하세요
        </Text>
      </View>

      {/* 버튼 */}
      <View className="absolute bottom-4 left-4 right-4 flex-row gap-3">
        <TouchableOpacity
          onPress={onCancel}
          className="flex-1 bg-surface border border-border rounded-lg py-3 active:opacity-70"
        >
          <Text className="text-foreground text-center font-semibold">취소</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleCrop}
          className="flex-1 bg-primary rounded-lg py-3 active:opacity-80"
        >
          <Text className="text-white text-center font-semibold">자르기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
