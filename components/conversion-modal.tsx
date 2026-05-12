import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useFileConverter } from "@/hooks/use-file-converter";
import { DocumentMetadata } from "@/lib/file-manager";

interface ConversionModalProps {
  visible: boolean;
  document: DocumentMetadata | null;
  onClose: () => void;
  onSuccess?: (outputPath: string) => void;
}

interface ConversionOption {
  id: string;
  label: string;
  format: string;
}

export function ConversionModal({
  visible,
  document,
  onClose,
  onSuccess,
}: ConversionModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [availableFormats, setAvailableFormats] = useState<ConversionOption[]>(
    []
  );
  const {
    isConverting,
    progress,
    convertPdfToImage,
    convertPptxToPdf,
    convertXlsxToPdf,
    convertHwpToPdf,
    shareConvertedFile,
  } = useFileConverter();

  useEffect(() => {
    if (document) {
      const formats = getAvailableConversions(document.type);
      setAvailableFormats(formats);
      setSelectedFormat(formats[0]?.format || null);
    }
  }, [document]);

  const getAvailableConversions = (fileType: string): ConversionOption[] => {
    switch (fileType) {
      case "pdf":
        return [
          {
            id: "pdf-to-image",
            label: "이미지 (PNG)",
            format: "image",
          },
        ];
      case "pptx":
        return [
          {
            id: "pptx-to-pdf",
            label: "PDF",
            format: "pdf",
          },
        ];
      case "xlsx":
        return [
          {
            id: "xlsx-to-pdf",
            label: "PDF",
            format: "pdf",
          },
        ];
      case "hwp":
        return [
          {
            id: "hwp-to-pdf",
            label: "PDF",
            format: "pdf",
          },
        ];
      default:
        return [];
    }
  };

  const handleConvert = async () => {
    if (!document || !selectedFormat) return;

    try {
      let result;

      if (document.type === "pdf" && selectedFormat === "image") {
        result = await convertPdfToImage(document.path);
      } else if (document.type === "pptx" && selectedFormat === "pdf") {
        result = await convertPptxToPdf(document.path);
      } else if (document.type === "xlsx" && selectedFormat === "pdf") {
        result = await convertXlsxToPdf(document.path);
      } else if (document.type === "hwp" && selectedFormat === "pdf") {
        result = await convertHwpToPdf(document.path);
      } else {
        Alert.alert("오류", "지원하지 않는 변환입니다.");
        return;
      }

      if (result.success && result.data) {
        Alert.alert("성공", result.message || "파일이 변환되었습니다.", [
          {
            text: "확인",
            onPress: () => {
              onSuccess?.(result.data!);
              onClose();
            },
          },
          {
            text: "공유",
            onPress: async () => {
              await shareConvertedFile(result.data!);
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert("오류", result.error || "파일 변환에 실패했습니다.");
      }
    } catch (error) {
      Alert.alert("오류", "파일 변환 중 오류가 발생했습니다.");
    }
  };

  if (!document) return null;

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
            <Text className="text-xl font-bold text-foreground">파일 변환</Text>
            <TouchableOpacity onPress={onClose} className="active:opacity-70">
              <Text className="text-2xl text-muted">✕</Text>
            </TouchableOpacity>
          </View>

          {/* 원본 파일 정보 */}
          <View className="bg-surface rounded-lg p-4 border border-border">
            <Text className="text-xs text-muted mb-1">원본 파일</Text>
            <Text className="text-foreground font-semibold truncate">
              {document.name}
            </Text>
            <Text className="text-xs text-muted mt-1">
              형식: {document.type.toUpperCase()}
            </Text>
          </View>

          {/* 변환 형식 선택 */}
          {availableFormats.length > 0 ? (
            <>
              <Text className="text-sm font-semibold text-foreground">
                변환 형식 선택
              </Text>
              <ScrollView className="max-h-40">
                {availableFormats.map((format) => (
                  <TouchableOpacity
                    key={format.id}
                    onPress={() => setSelectedFormat(format.format)}
                    className={`p-3 rounded-lg mb-2 border-2 ${
                      selectedFormat === format.format
                        ? "bg-primary border-primary"
                        : "bg-surface border-border"
                    }`}
                  >
                    <Text
                      className={`font-semibold ${
                        selectedFormat === format.format
                          ? "text-white"
                          : "text-foreground"
                      }`}
                    >
                      {format.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <View className="bg-surface rounded-lg p-4 items-center">
              <Text className="text-muted">
                이 파일 형식은 변환을 지원하지 않습니다.
              </Text>
            </View>
          )}

          {/* 진행률 표시 */}
          {isConverting && (
            <View className="gap-2">
              <View className="bg-surface rounded-lg h-2 overflow-hidden">
                <View
                  className="bg-primary h-full"
                  style={{ width: `${progress}%` }}
                />
              </View>
              <Text className="text-xs text-muted text-center">
                변환 중... {progress}%
              </Text>
            </View>
          )}

          {/* 버튼 */}
          <View className="flex-row gap-3 mt-4">
            <TouchableOpacity
              onPress={onClose}
              disabled={isConverting}
              className="flex-1 bg-surface border border-border rounded-lg py-3 active:opacity-70"
            >
              <Text className="text-foreground text-center font-semibold">
                취소
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleConvert}
              disabled={isConverting || !selectedFormat}
              className={`flex-1 rounded-lg py-3 active:opacity-80 flex-row items-center justify-center gap-2 ${
                isConverting || !selectedFormat
                  ? "bg-muted opacity-50"
                  : "bg-primary"
              }`}
            >
              {isConverting && <ActivityIndicator color="white" size="small" />}
              <Text className="text-white text-center font-semibold">
                {isConverting ? "변환 중..." : "변환"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
