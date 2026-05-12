import React, { useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";

interface HWPViewerProps {
  uri: string;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function HWPViewer({ uri, onPageChange }: HWPViewerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    loadHWPFile();
  }, [uri]);

  const loadHWPFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // HWP 파일 처리
      // 한글 파일은 복잡한 바이너리 형식이므로
      // 다음 방법 중 하나를 사용해야 합니다:
      // 1. 백엔드 서비스에서 PDF로 변환
      // 2. hwp.js 라이브러리 사용
      // 3. 사용자에게 PDF로 변환하도록 안내

      setError(
        "한글 파일 뷰어는 현재 개발 중입니다.\n파일을 PDF로 변환한 후 사용해주세요."
      );
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load HWP file:", err);
      setError("한글 파일을 읽을 수 없습니다.");
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background items-center justify-center">
      {isLoading && (
        <>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text className="mt-4 text-muted">한글 파일 로딩 중...</Text>
        </>
      )}

      {error && (
        <View className="px-6 py-4 bg-surface rounded-lg mx-4">
          <Text className="text-error text-center font-semibold mb-2">
            한글 파일 지원
          </Text>
          <Text className="text-muted text-center text-sm leading-relaxed">
            {error}
          </Text>
        </View>
      )}

      {!isLoading && !error && (
        <Text className="text-muted">한글 파일을 준비 중입니다...</Text>
      )}
    </View>
  );
}
