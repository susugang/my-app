import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, Dimensions } from "react-native";
import PdfView from "react-native-pdf";
import { useDocument } from "@/lib/document-context";

interface PDFViewerProps {
  uri: string;
  onPageChange?: (page: number, totalPages: number) => void;
}

export function PDFViewer({ uri, onPageChange }: PDFViewerProps) {
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { state } = useDocument();

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const handleLoadComplete = (numberOfPages: number) => {
    setTotalPages(numberOfPages);
    setIsLoading(false);
    onPageChange?.(1, numberOfPages);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    onPageChange?.(page, totalPages);
  };

  return (
    <View className="flex-1 bg-background">
      {isLoading && (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0066CC" />
          <Text className="mt-4 text-muted">PDF 로딩 중...</Text>
        </View>
      )}

      <PdfView
        source={{ uri }}
        onLoadComplete={handleLoadComplete}
        onPageChanged={handlePageChange}
        onError={(error: any) => {
          console.error("PDF Error:", error);
          setIsLoading(false);
        }}
        style={{
          flex: 1,
          width: screenWidth,
          height: screenHeight,
        }}
        page={currentPage}
        scale={state.zoom}
        minScale={0.5}
        maxScale={3}
        horizontal={false}
        enablePaging={true}
        enableRTL={false}
        spacing={10}
      />

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
