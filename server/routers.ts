import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { insertDownloadRecord } from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  video: router({
    detectPlatform: publicProcedure
      .input(z.object({ url: z.string().url() }))
      .query(({ input }) => {
        const { detectPlatform } = require("./videoDownload");
        return {
          platform: detectPlatform(input.url),
        };
      }),

    validateUrl: publicProcedure
      .input(z.object({ url: z.string() }))
      .query(({ input }) => {
        const { isValidUrl } = require("./videoDownload");
        return {
          isValid: isValidUrl(input.url),
        };
      }),

    getMetadata: publicProcedure
      .input(z.object({ url: z.string().url() }))
      .query(async ({ input }) => {
        const { getVideoMetadata } = require("./videoDownload");
        return await getVideoMetadata(input.url);
      }),

    download: protectedProcedure
      .input(
        z.object({
          url: z.string().url(),
          format: z.enum(["mp4-hd", "mp4-sd", "mp3"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const { downloadVideo } = require("./videoDownload");
        const result = await downloadVideo(input.url, {
          format: input.format || "mp4-hd",
        });

        // Record download in database
        if (result.success && ctx.user) {
          try {
            await insertDownloadRecord({
              userId: ctx.user.id,
              url: input.url,
              platform: result.platform || "Unknown",
              videoTitle: result.metadata?.title,
              videoDuration: result.metadata?.duration,
              thumbnail: result.metadata?.thumbnail,
              downloadedFormat: input.format || "mp4-hd",
              status: "success",
              fileSize: 0,
            });
          } catch (error) {
            console.error("[tRPC] Failed to record download:", error);
          }
        }

        return result;
      }),

    uploadToCloud: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileData: z.string(),
          platform: z.string(),
          fileSize: z.number(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const { storagePut } = require("./storage");
          const buffer = Buffer.from(input.fileData, "base64");
          const result = await storagePut(
            `videos/${ctx.user.id}/${input.platform}/${Date.now()}-${input.fileName}`,
            buffer,
            "video/mp4"
          );
          try {
            await insertDownloadRecord({
              userId: ctx.user.id,
              url: result.url,
              platform: input.platform,
              videoTitle: input.fileName,
              videoDuration: 0,
              thumbnail: "",
              downloadedFormat: "cloud-stored",
              status: "success",
              fileSize: input.fileSize,
            });
          } catch (dbError) {
            console.warn("[tRPC] Failed to record cloud upload:", dbError);
          }
          return {
            success: true,
            url: result.url,
            key: result.key,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("[tRPC] Upload to cloud failed:", errorMessage);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Upload failed: ${errorMessage}`,
          });
        }
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
