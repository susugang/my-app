import { useState } from "react";
import { trpc } from "@/lib/trpc";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export interface ConversionResult {
  success: boolean;
  data?: string;
  error?: string;
  message?: string;
}

export function useFileConverter() {
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);

  const convertPdfToImage = trpc.converter.convertPdfToImage.useMutation();
  const convertPptxToPdf = trpc.converter.convertPptxToPdf.useMutation();
  const convertXlsxToPdf = trpc.converter.convertXlsxToPdf.useMutation();
  const convertHwpToPdf = trpc.converter.convertHwpToPdf.useMutation();

  /**
   * 파일을 Base64로 변환
   */
  const fileToBase64 = async (filePath: string): Promise<string> => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return fileContent;
    } catch (error) {
      throw new Error("파일을 읽을 수 없습니다.");
    }
  };

  /**
   * Base64를 파일로 저장
   */
  const base64ToFile = async (
    base64Data: string,
    fileName: string
  ): Promise<string> => {
    try {
      const documentsDir = FileSystem.documentDirectory;
      if (!documentsDir) {
        throw new Error("문서 디렉토리를 찾을 수 없습니다.");
      }

      const filePath = `${documentsDir}${fileName}`;
      await FileSystem.writeAsStringAsync(filePath, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return filePath;
    } catch (error) {
      throw new Error("파일을 저장할 수 없습니다.");
    }
  };

  /**
   * PDF를 이미지로 변환
   */
  const handleConvertPdfToImage = async (
    filePath: string
  ): Promise<ConversionResult> => {
    try {
      setIsConverting(true);
      setProgress(0);

      // 파일을 Base64로 변환
      const base64Data = await fileToBase64(filePath);
      setProgress(30);

      // 서버에 변환 요청
      const result = await convertPdfToImage.mutateAsync({
        fileBuffer: base64Data,
        pageNumber: 1,
      });
      setProgress(70);

      if (result.success && result.data) {
        // 변환된 이미지 저장
        const timestamp = new Date().getTime();
        const fileName = `converted_${timestamp}.png`;
        const outputPath = await base64ToFile(result.data, fileName);
        setProgress(100);

        return {
          success: true,
          data: outputPath,
          message: result.message,
        };
      } else {
        return {
          success: false,
          error: result.error || "변환 실패",
        };
      }
    } catch (error) {
      console.error("PDF to Image conversion error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "변환 중 오류가 발생했습니다.",
      };
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  /**
   * PPTX를 PDF로 변환
   */
  const handleConvertPptxToPdf = async (
    filePath: string
  ): Promise<ConversionResult> => {
    try {
      setIsConverting(true);
      setProgress(0);

      const base64Data = await fileToBase64(filePath);
      setProgress(30);

      const result = await convertPptxToPdf.mutateAsync({
        fileBuffer: base64Data,
      });
      setProgress(70);

      if (result.success && result.data) {
        const timestamp = new Date().getTime();
        const fileName = `converted_${timestamp}.pdf`;
        const outputPath = await base64ToFile(result.data, fileName);
        setProgress(100);

        return {
          success: true,
          data: outputPath,
          message: result.message,
        };
      } else {
        return {
          success: false,
          error: result.error || "변환 실패",
        };
      }
    } catch (error) {
      console.error("PPTX to PDF conversion error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "변환 중 오류가 발생했습니다.",
      };
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  /**
   * XLSX를 PDF로 변환
   */
  const handleConvertXlsxToPdf = async (
    filePath: string
  ): Promise<ConversionResult> => {
    try {
      setIsConverting(true);
      setProgress(0);

      const base64Data = await fileToBase64(filePath);
      setProgress(30);

      const result = await convertXlsxToPdf.mutateAsync({
        fileBuffer: base64Data,
      });
      setProgress(70);

      if (result.success && result.data) {
        const timestamp = new Date().getTime();
        const fileName = `converted_${timestamp}.pdf`;
        const outputPath = await base64ToFile(result.data, fileName);
        setProgress(100);

        return {
          success: true,
          data: outputPath,
          message: result.message,
        };
      } else {
        return {
          success: false,
          error: result.error || "변환 실패",
        };
      }
    } catch (error) {
      console.error("XLSX to PDF conversion error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "변환 중 오류가 발생했습니다.",
      };
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  /**
   * HWP를 PDF로 변환
   */
  const handleConvertHwpToPdf = async (
    filePath: string
  ): Promise<ConversionResult> => {
    try {
      setIsConverting(true);
      setProgress(0);

      const base64Data = await fileToBase64(filePath);
      setProgress(30);

      const result = await convertHwpToPdf.mutateAsync({
        fileBuffer: base64Data,
      });
      setProgress(70);

      if (result.success && result.data) {
        const timestamp = new Date().getTime();
        const fileName = `converted_${timestamp}.pdf`;
        const outputPath = await base64ToFile(result.data, fileName);
        setProgress(100);

        return {
          success: true,
          data: outputPath,
          message: result.message,
        };
      } else {
        return {
          success: false,
          error: result.error || "변환 실패",
        };
      }
    } catch (error) {
      console.error("HWP to PDF conversion error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "변환 중 오류가 발생했습니다.",
      };
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  /**
   * 변환된 파일 공유
   */
  const shareConvertedFile = async (filePath: string): Promise<boolean> => {
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
  };

  return {
    isConverting,
    progress,
    convertPdfToImage: handleConvertPdfToImage,
    convertPptxToPdf: handleConvertPptxToPdf,
    convertXlsxToPdf: handleConvertXlsxToPdf,
    convertHwpToPdf: handleConvertHwpToPdf,
    shareConvertedFile,
  };
}
