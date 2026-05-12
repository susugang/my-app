import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  saveTempFile,
  convertPdfToImage,
  convertPptxToPdf,
  convertXlsxToPdf,
  convertHwpToPdf,
  cleanupTempFiles,
} from "./converters.js";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // 파일 변환 API
  converter: router({
    convertPdfToImage: publicProcedure
      .input(
        z.object({
          fileBuffer: z.string(),
          pageNumber: z.number().optional().default(1),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.fileBuffer, "base64");
          const pdfPath = await saveTempFile(buffer, "pdf");

          const imageBuffer = await convertPdfToImage(
            pdfPath,
            input.pageNumber
          );

          return {
            success: true,
            data: imageBuffer.toString("base64"),
            message: "PDF가 이미지로 변환되었습니다.",
          };
        } catch (error) {
          console.error("PDF to Image conversion error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "변환 실패",
          };
        }
      }),

    convertPptxToPdf: publicProcedure
      .input(
        z.object({
          fileBuffer: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.fileBuffer, "base64");
          const pptxPath = await saveTempFile(buffer, "pptx");

          const pdfBuffer = await convertPptxToPdf(pptxPath);

          return {
            success: true,
            data: pdfBuffer.toString("base64"),
            message: "PPTX가 PDF로 변환되었습니다.",
          };
        } catch (error) {
          console.error("PPTX to PDF conversion error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "변환 실패",
          };
        }
      }),

    convertXlsxToPdf: publicProcedure
      .input(
        z.object({
          fileBuffer: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.fileBuffer, "base64");
          const xlsxPath = await saveTempFile(buffer, "xlsx");

          const pdfBuffer = await convertXlsxToPdf(xlsxPath);

          return {
            success: true,
            data: pdfBuffer.toString("base64"),
            message: "XLSX가 PDF로 변환되었습니다.",
          };
        } catch (error) {
          console.error("XLSX to PDF conversion error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "변환 실패",
          };
        }
      }),

    convertHwpToPdf: publicProcedure
      .input(
        z.object({
          fileBuffer: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.fileBuffer, "base64");
          const hwpPath = await saveTempFile(buffer, "hwp");

          const pdfBuffer = await convertHwpToPdf(hwpPath);

          return {
            success: true,
            data: pdfBuffer.toString("base64"),
            message: "HWP가 PDF로 변환되었습니다.",
          };
        } catch (error) {
          console.error("HWP to PDF conversion error:", error);
          return {
            success: false,
            error: error instanceof Error ? error.message : "변환 실패",
          };
        }
      }),

    cleanup: publicProcedure.mutation(() => {
      cleanupTempFiles();
      return { success: true, message: "임시 파일이 정리되었습니다." };
    }),
  }),
});

export type AppRouter = typeof appRouter;
