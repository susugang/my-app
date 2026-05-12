import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, Image, ScrollView, Dimensions } from "react-native";
import { readFileAsBase64 } from "@/lib/file-manager";
import { useDocument } from "@/lib/document-context";

interface PPTXViewerProps {
  uri: string;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function PPTXViewer({ uri, onPageChange }: PPTXViewerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slideImages, setSlideImages] = useState<string[]>([]);
  const { state } = useDocument();

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  useEffect(() => {
    loadPPTXFile();
  }, [uri]);

  const loadPPTXFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // PPTX 파일 로드 시뮬레이션
      // 실제 구현에서는 pptxjs 또는 유사 라이브러리를 사용하여
      // 슬라이드를 이미지로 변환해야 합니다.
      const base64Data = await readFileAsBase64(uri);

      // 임시: 파일이 로드되었음을 표시
      // 실제 구현: pptxjs를 사용하여 슬라이드 렌더링
      setTotalPages(1);
      setSlideImages([]);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load PPTX file:", err);
      setError("PowerPoint 파일을 읽을 수 없습니다.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0066CC" />
        <Text className="mt-4 text-muted">PowerPoint 파일 로딩 중...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-error text-center px-4">{error}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 20,
        }}
      >
        <View
          className="bg-surface rounded-lg overflow-hidden"
          style={{
            width: screenWidth - 32,
            height: screenHeight - 200,
            transform: [{ scale: state.zoom }],
          }}
        >
          {slideImages.length > 0 ? (
            <Image
              source={{ uri: slideImages[currentPage - 1] }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="contain"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-muted">
                슬라이드 {currentPage} / {totalPages}
              </Text>
              <Text className="text-xs text-muted mt-2">
                (슬라이드 미리보기는 개발 중입니다)
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {totalPages > 0 && (
        <View className="absolute bottom-4 left-0 right-0 items-center">
          <View className="bg-black/70 px-4 py-2 rounded-full">
            <Text className="text-white text-sm font-semibold">
              {currentPage} / {totalPages}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
