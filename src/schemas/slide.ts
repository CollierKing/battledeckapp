import { z } from "zod";

const CreateCaptionSchema = z
  .object({
    action: z.enum(["create_slide_image", "create_slide_caption"]),
    aiPrompt: z.string().optional(),
    aiCaption: z.string().optional(),
    files: z.array(
      z.object({
        file: z.instanceof(File),
        id: z.string(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    if (data.action === "create_slide_image" && !data.aiPrompt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "AI Prompt is required",
      });
      return;
    }

    if (data.action === "create_slide_caption" && !data.files.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "An image is required to generate a caption",
      });
      return;
    }
  });

const CreateSlideSchema = z
  .object({
    action: z.enum(["create_slide_image", "create_slide_caption"]),
    files: z.array(
      z.object({
        file: z.instanceof(File),
        id: z.string(),
      })
    ),
    aiPrompt: z.string().optional(),
    aiCaption: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.action === "create_slide_image" && !data.aiPrompt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "AI Prompt is required",
      });
    }

    if (data.action === "create_slide_caption" && !data.aiCaption) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Caption is required",
      });
    }

    if (!data.files.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "An image is required",
      });
    }
  });

export { CreateCaptionSchema, CreateSlideSchema };
