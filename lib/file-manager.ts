import * as FileSystem from "expo-file-system/legacy";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface RecentFile {
  id: string;
  name: string;
  path: string;
  type: "pdf" | "pptx" | "xlsx" | "hwp";
  lastOpened: number;
  size: number;
}

export interface DocumentMetadata {
  id: string;
  name: string;
  path: string;
  type: "pdf" | "pptx" | "xlsx" | "hwp";
  pages?: number;
  sheets?: number;
  createdAt: number;
  modifiedAt: number;
  size: number;
}

const RECENT_FILES_KEY = "recent_files";
const MAX_RECENT_FILES = 10;

/**
 * 최근 파일 목록에 파일 추가
 */
export async function addRecentFile(file: RecentFile): Promise<void> {
  try {
    const recentFiles = await getRecentFiles();
    
    // 중복 제거
    const filtered = recentFiles.filter((f) => f.id !== file.id);
    
    // 새 파일을 맨 앞에 추가
    const updated = [file, ...filtered].slice(0, MAX_RECENT_FILES);
    
    await AsyncStorage.setItem(RECENT_FILES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to add recent file:", error);
  }
}

/**
 * 최근 파일 목록 조회
 */
export async function getRecentFiles(): Promise<RecentFile[]> {
  try {
    const data = await AsyncStorage.getItem(RECENT_FILES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get recent files:", error);
    return [];
  }
}

/**
 * 파일 타입 판별
 */
export function getFileType(
  filename: string
): "pdf" | "pptx" | "xlsx" | "hwp" | null {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf":
      return "pdf";
    case "pptx":
    case "ppt":
      return "pptx";
    case "xlsx":
    case "xls":
      return "xlsx";
    case "hwp":
    case "hwpx":
      return "hwp";
    default:
      return null;
  }
}

/**
 * 파일 크기를 읽기 쉬운 형식으로 변환
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * 파일 정보 조회
 */
export async function getFileInfo(uri: string): Promise<DocumentMetadata | null> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) return null;

    const filename = uri.split("/").pop() || "unknown";
    const type = getFileType(filename);

    if (!type) return null;

    return {
      id: uri,
      name: filename,
      path: uri,
      type,
      createdAt: fileInfo.modificationTime ? fileInfo.modificationTime * 1000 : Date.now(),
      modifiedAt: fileInfo.modificationTime ? fileInfo.modificationTime * 1000 : Date.now(),
      size: fileInfo.size || 0,
    };
  } catch (error) {
    console.error("Failed to get file info:", error);
    return null;
  }
}

/**
 * 파일 복사
 */
export async function copyFile(sourceUri: string, destinationUri: string): Promise<void> {
  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: destinationUri,
    });
  } catch (error) {
    console.error("Failed to copy file:", error);
    throw error;
  }
}

/**
 * 파일 삭제
 */
export async function deleteFile(uri: string): Promise<void> {
  try {
    await FileSystem.deleteAsync(uri);
  } catch (error) {
    console.error("Failed to delete file:", error);
    throw error;
  }
}

/**
 * 파일 읽기 (Base64)
 */
export async function readFileAsBase64(uri: string): Promise<string> {
  try {
    const content = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return content;
  } catch (error) {
    console.error("Failed to read file:", error);
    throw error;
  }
}

/**
 * 파일 쓰기
 */
export async function writeFile(uri: string, content: string): Promise<void> {
  try {
    await FileSystem.writeAsStringAsync(uri, content);
  } catch (error) {
    console.error("Failed to write file:", error);
    throw error;
  }
}

/**
 * 임시 디렉토리 경로
 */
export function getTempDirectory(): string {
  return FileSystem.cacheDirectory || "";
}

/**
 * 문서 디렉토리 경로
 */
export function getDocumentDirectory(): string {
  return FileSystem.documentDirectory || "";
}
