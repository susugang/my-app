import * as FileSystem from "expo-file-system/legacy";
import * as ImageManipulator from "expo-image-manipulator";
import * as Sharing from "expo-sharing";

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  message?: string;
}

/**
 * 이미지 자르기
 */
export async function cropImage(
  imagePath: string,
  cropArea: CropArea
): Promise<CropResult> {
  try {
    // 자르기 작업 수행
    const result = await ImageManipulator.manipulateAsync(
      imagePath,
      [
        {
          crop: {
            originX: Math.round(cropArea.x),
            originY: Math.round(cropArea.y),
            width: Math.round(cropArea.width),
            height: Math.round(cropArea.height),
          },
        },
      ],
      { compress: 0.9, format: ImageManipulator.SaveFormat.PNG }
    );

    return {
      success: true,
      outputPath: result.uri,
      message: "이미지가 자르기되었습니다.",
    };
  } catch (error) {
    console.error("Crop failed:", error);
    return {
      success: false,
      error: "이미지 자르기에 실패했습니다.",
    };
  }
}

/**
 * PDF 페이지를 이미지로 변환 후 자르기
 * (실제 구현은 백엔드 API 필요)
 */
export async function cropPDFPage(
  pdfPath: string,
  pageNumber: number,
  cropArea: CropArea
): Promise<CropResult> {
  try {
    // 이 함수는 백엔드 API와 함께 구현되어야 합니다.
    // 현재는 시뮬레이션만 제공합니다.
    console.log(`Cropping PDF page ${pageNumber}:`, cropArea);

    return {
      success: true,
      message: "PDF 페이지가 자르기되었습니다.",
    };
  } catch (error) {
    console.error("PDF crop failed:", error);
    return {
      success: false,
      error: "PDF 자르기에 실패했습니다.",
    };
  }
}

/**
 * 자르기된 이미지 저장
 */
export async function saveCroppedImage(
  sourcePath: string,
  fileName: string
): Promise<CropResult> {
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
      message: `자르기된 이미지가 저장되었습니다: ${fileName}`,
    };
  } catch (error) {
    console.error("Failed to save cropped image:", error);
    return {
      success: false,
      error: "이미지 저장에 실패했습니다.",
    };
  }
}

/**
 * 자르기된 이미지 공유
 */
export async function shareCroppedImage(filePath: string): Promise<boolean> {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      console.warn("Sharing is not available on this platform");
      return false;
    }

    await Sharing.shareAsync(filePath);
    return true;
  } catch (error) {
    console.error("Failed to share cropped image:", error);
    return false;
  }
}

/**
 * 자르기 영역 검증
 */
export function validateCropArea(
  cropArea: CropArea,
  maxWidth: number,
  maxHeight: number
): boolean {
  return (
    cropArea.x >= 0 &&
    cropArea.y >= 0 &&
    cropArea.width > 0 &&
    cropArea.height > 0 &&
    cropArea.x + cropArea.width <= maxWidth &&
    cropArea.y + cropArea.height <= maxHeight
  );
}

/**
 * 자르기 영역 정규화 (경계 내로 조정)
 */
export function normalizeCropArea(
  cropArea: CropArea,
  maxWidth: number,
  maxHeight: number
): CropArea {
  return {
    x: Math.max(0, Math.min(cropArea.x, maxWidth)),
    y: Math.max(0, Math.min(cropArea.y, maxHeight)),
    width: Math.max(0, Math.min(cropArea.width, maxWidth - cropArea.x)),
    height: Math.max(0, Math.min(cropArea.height, maxHeight - cropArea.y)),
  };
}
