import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { execSync, spawn } from "child_process";

const TEMP_DIR = path.join(os.tmpdir(), "doc-converter");

// Temp 디렉토리 생성
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

/**
 * 파일을 임시 디렉토리에 저장
 */
export async function saveTempFile(
  buffer: Buffer,
  extension: string
): Promise<string> {
  const filename = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${extension}`;
  const filepath = path.join(TEMP_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

/**
 * PDF를 이미지로 변환 (PNG)
 */
export async function convertPdfToImage(
  pdfPath: string,
  pageNumber: number = 1
): Promise<Buffer> {
  try {
    const outputPath = path.join(
      TEMP_DIR,
      `pdf_to_image_${Date.now()}.png`
    );

    // LibreOffice를 사용하여 PDF를 이미지로 변환
    const command = `libreoffice --headless --convert-to png --outdir "${TEMP_DIR}" "${pdfPath}"`;
    execSync(command, { stdio: "pipe" });

    // 변환된 파일 찾기
    const basename = path.basename(pdfPath, path.extname(pdfPath));
    const convertedPath = path.join(TEMP_DIR, `${basename}.png`);

    if (fs.existsSync(convertedPath)) {
      const buffer = fs.readFileSync(convertedPath);
      // 임시 파일 삭제
      fs.unlinkSync(convertedPath);
      return buffer;
    }

    throw new Error("PDF 변환 실패: 출력 파일을 찾을 수 없습니다.");
  } catch (error) {
    console.error("PDF to Image conversion error:", error);
    throw new Error("PDF를 이미지로 변환하는 중 오류가 발생했습니다.");
  }
}

/**
 * PPTX를 PDF로 변환
 */
export async function convertPptxToPdf(pptxPath: string): Promise<Buffer> {
  try {
    // LibreOffice를 사용하여 PPTX를 PDF로 변환
    const command = `libreoffice --headless --convert-to pdf --outdir "${TEMP_DIR}" "${pptxPath}"`;
    execSync(command, { stdio: "pipe" });

    // 변환된 파일 찾기
    const basename = path.basename(pptxPath, path.extname(pptxPath));
    const convertedPath = path.join(TEMP_DIR, `${basename}.pdf`);

    if (fs.existsSync(convertedPath)) {
      const buffer = fs.readFileSync(convertedPath);
      // 임시 파일 삭제
      fs.unlinkSync(convertedPath);
      return buffer;
    }

    throw new Error("PPTX 변환 실패: 출력 파일을 찾을 수 없습니다.");
  } catch (error) {
    console.error("PPTX to PDF conversion error:", error);
    throw new Error("PPTX를 PDF로 변환하는 중 오류가 발생했습니다.");
  }
}

/**
 * XLSX를 PDF로 변환
 */
export async function convertXlsxToPdf(xlsxPath: string): Promise<Buffer> {
  try {
    // LibreOffice를 사용하여 XLSX를 PDF로 변환
    const command = `libreoffice --headless --convert-to pdf --outdir "${TEMP_DIR}" "${xlsxPath}"`;
    execSync(command, { stdio: "pipe" });

    // 변환된 파일 찾기
    const basename = path.basename(xlsxPath, path.extname(xlsxPath));
    const convertedPath = path.join(TEMP_DIR, `${basename}.pdf`);

    if (fs.existsSync(convertedPath)) {
      const buffer = fs.readFileSync(convertedPath);
      // 임시 파일 삭제
      fs.unlinkSync(convertedPath);
      return buffer;
    }

    throw new Error("XLSX 변환 실패: 출력 파일을 찾을 수 없습니다.");
  } catch (error) {
    console.error("XLSX to PDF conversion error:", error);
    throw new Error("XLSX를 PDF로 변환하는 중 오류가 발생했습니다.");
  }
}

/**
 * HWP를 PDF로 변환
 */
export async function convertHwpToPdf(hwpPath: string): Promise<Buffer> {
  try {
    // LibreOffice를 사용하여 HWP를 PDF로 변환
    const command = `libreoffice --headless --convert-to pdf --outdir "${TEMP_DIR}" "${hwpPath}"`;
    execSync(command, { stdio: "pipe" });

    // 변환된 파일 찾기
    const basename = path.basename(hwpPath, path.extname(hwpPath));
    const convertedPath = path.join(TEMP_DIR, `${basename}.pdf`);

    if (fs.existsSync(convertedPath)) {
      const buffer = fs.readFileSync(convertedPath);
      // 임시 파일 삭제
      fs.unlinkSync(convertedPath);
      return buffer;
    }

    throw new Error("HWP 변환 실패: 출력 파일을 찾을 수 없습니다.");
  } catch (error) {
    console.error("HWP to PDF conversion error:", error);
    throw new Error("HWP를 PDF로 변환하는 중 오류가 발생했습니다.");
  }
}

/**
 * PDF에서 텍스트 추출
 */
export async function extractTextFromPdf(pdfPath: string): Promise<string> {
  try {
    const dataBuffer = fs.readFileSync(pdfPath);
    // pdf-parse는 Node.js 환경에서만 사용 가능
    // 현재는 간단한 구현만 제공
    return "PDF 텍스트 추출은 준비 중입니다.";
  } catch (error) {
    console.error("PDF text extraction error:", error);
    throw new Error("PDF에서 텍스트를 추출하는 중 오류가 발생했습니다.");
  }
}

/**
 * 변환 진행 상황 시뮬레이션
 */
export async function simulateConversionProgress(
  callback: (progress: number) => void
): Promise<void> {
  for (let i = 0; i <= 100; i += 10) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    callback(i);
  }
}

/**
 * 임시 파일 정리
 */
export function cleanupTempFiles(): void {
  try {
    if (fs.existsSync(TEMP_DIR)) {
      const files = fs.readdirSync(TEMP_DIR);
      files.forEach((file) => {
        const filepath = path.join(TEMP_DIR, file);
        const stats = fs.statSync(filepath);
        // 1시간 이상 된 파일 삭제
        if (Date.now() - stats.mtimeMs > 3600000) {
          fs.unlinkSync(filepath);
        }
      });
    }
  } catch (error) {
    console.error("Cleanup error:", error);
  }
}

/**
 * 파일 크기 확인
 */
export function getFileSize(filePath: string): number {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}
