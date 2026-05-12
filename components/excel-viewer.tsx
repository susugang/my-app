import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, ScrollView, FlatList, Dimensions } from "react-native";
import * as XLSX from "xlsx";
import { readFileAsBase64 } from "@/lib/file-manager";
import { useDocument } from "@/lib/document-context";

interface ExcelViewerProps {
  uri: string;
  onSheetChange?: (sheetIndex: number, totalSheets: number) => void;
}

interface SheetData {
  name: string;
  data: any[][];
}

export function ExcelViewer({ uri, onSheetChange }: ExcelViewerProps) {
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { state } = useDocument();

  const screenWidth = Dimensions.get("window").width;

  useEffect(() => {
    loadExcelFile();
  }, [uri]);

  const loadExcelFile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const base64Data = await readFileAsBase64(uri);
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const workbook = XLSX.read(bytes, { type: "array" });
      const sheetData: SheetData[] = [];

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
        sheetData.push({ name: sheetName, data });
      }

      setSheets(sheetData);
      onSheetChange?.(0, sheetData.length);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to load Excel file:", err);
      setError("Excel 파일을 읽을 수 없습니다.");
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0066CC" />
        <Text className="mt-4 text-muted">Excel 파일 로딩 중...</Text>
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

  if (sheets.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-muted">데이터가 없습니다.</Text>
      </View>
    );
  }

  const currentSheet = sheets[currentSheetIndex];
  const cellWidth = Math.max(60, screenWidth / 5);

  return (
    <View className="flex-1 bg-background">
      {/* 시트 탭 */}
      <View className="flex-row bg-surface border-b border-border px-2 py-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {sheets.map((sheet, index) => (
            <Text
              key={index}
              onPress={() => {
                setCurrentSheetIndex(index);
                onSheetChange?.(index, sheets.length);
              }}
              className={`px-3 py-2 rounded-lg mr-2 font-semibold ${
                index === currentSheetIndex
                  ? "bg-primary text-white"
                  : "bg-background text-muted"
              }`}
            >
              {sheet.name}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* 데이터 테이블 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
        className="flex-1"
        style={{ transform: [{ scale: state.zoom }] }}
      >
        <View>
          {currentSheet.data.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row bg-background border-b border-border">
              {row.map((cell, cellIndex) => (
                <View
                  key={cellIndex}
                  className={`border-r border-border p-2 ${
                    rowIndex === 0 ? "bg-surface" : ""
                  }`}
                  style={{ width: cellWidth, minHeight: 40 }}
                >
                  <Text
                    className={`text-xs ${
                      rowIndex === 0
                        ? "font-bold text-foreground"
                        : "text-foreground"
                    }`}
                    numberOfLines={2}
                  >
                    {cell ?? ""}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 시트 인디케이터 */}
      {sheets.length > 0 && (
        <View className="absolute bottom-4 left-0 right-0 items-center">
          <View className="bg-black/70 px-4 py-2 rounded-full">
            <Text className="text-white text-sm font-semibold">
              {currentSheetIndex + 1} / {sheets.length}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
