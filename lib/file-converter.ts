import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { DocumentMetadata } from "./file-manager";

export type ConversionFormat = "pdf" | "image" | "text";

export interface ConversionOptions {
  format: ConversionFormat;
  quality?: number; // 0-100
  resolution?: number; // DPI
}

export interface ConversionResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  message?: string;
}

/**
 * 파일 변환 (시뮬레이션)
 * 실제 구현에서는 백엔드 서비스 또는 네이티브 라이브러리를 사용해야 합니다.
 */
export async function convertFile(
  document: DocumentMetadata,
  options: ConversionOptions
): Promise<ConversionResult> {
  try {
    // 변환 시뮬레이션
    const outputFileName = `${document.name.split(".")[0]}_converted`;
    const outputPath = `${FileSystem.cacheDirectory}${outputFileName}.${getExtension(
      options.format
    )}`;

    // 실제 변환 로직은 여기에 구현됩니다.
    // 현재는 파일 생성만 시뮬레이션합니다.
    await FileSystem.writeAsStringAsync(
      outputPath,
      `Converted from ${document.type} to ${options.format}`
    );

    return {
      success: true,
      outputPath,
      message: `${document.name}이 ${options.format}로 변환되었습니다.`,
    };
  } catch (error) {
    console.error("Conversion failed:", error);
    return {
      success: false,
      error: "파일 변환에 실패했습니다.",
    };
  }
}

/**
 * 변환된 파일 공유
 */
export async function shareConvertedFile(filePath: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn("Sharing is not available on this platform");
      return false;
    }

    await Sharing.shareAsync(filePath);
    return true;
  } catch (error) {
    console.error("Failed to share file:", error);
    return false;
  }
}

/**
 * 변환된 파일 저장
 */
export async function saveConvertedFile(
  sourcePath: string,
  fileName: string
): Promise<ConversionResult> {
  try {
    const documentsDir = FileSystem.documentDirectory;
    if (!documentsDir) {
      return {
        success: false,
        error: "문서 디렉토리를 찾을 수 없습니다.",
      };
    }

    const destinationPath = `${documentsDir}${fileName}`;
    await FileSystem.copyAsync({
      from: sourcePath,
      to: destinationPath,
    });

    return {
      success: true,
      outputPath: destinationPath,
      message: `파일이 저장되었습니다: ${fileName}`,
    };
  } catch (error) {
    console.error("Failed to save file:", error);
    return {
      success: false,
      error: "파일 저장에 실패했습니다.",
    };
  }
}

/**
 * 변환 형식에 따른 파일 확장자 반환
 */
function getExtension(format: ConversionFormat): string {
  switch (format) {
    case "pdf":
      return "pdf";
    case "image":
      return "png";
    case "text":
      return "txt";
    default:
      return "bin";
  }
}

/**
 * 변환 가능한 형식 확인
 */
export function getAvailableConversions(
  documentType: string
): ConversionFormat[] {
  switch (documentType) {
    case "pdf":
      return ["image", "text"];
    case "pptx":
      return ["pdf", "image"];
    case "xlsx":
      return ["pdf", "text"];
    case "hwp":
      return ["pdf", "text"];
    default:
      return [];
  }
}

/**
 * 변환 형식 라벨
 */
export function getFormatLabel(format: ConversionFormat): string {
  switch (format) {
    case "pdf":
      return "PDF";
    case "image":
      return "이미지 (PNG)";
    case "text":
      return "텍스트 (TXT)";
    default:
      return "알 수 없음";
  }
}
