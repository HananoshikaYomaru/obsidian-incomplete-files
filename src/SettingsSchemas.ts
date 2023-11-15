import { z } from "zod";
import { INCOMPLETE_REASON_TYPE } from "@/rules/INCOMPLETE_REASON_TYPE";

const incompleteReasonSchema = z.object({
	type: z.nativeEnum(INCOMPLETE_REASON_TYPE),
	/**
	 * e.g. "(INCOMPLETE_SYNTAX) H2 - What is it? "
	 */
	title: z.string(),
	/**
	 * if the reason has corresponding a heading
	 */
	heading: z
		.object({
			depth: z.number().min(1).max(6),
			text: z.string(),
		})
		.optional(),
});

export type IncompleteReason = z.infer<typeof incompleteReasonSchema>;

const fileSchema = z.object({
	path: z.string(),
	basename: z.string(),
	reasons: incompleteReasonSchema.array(),
	tags: z.string().array(),
	lastChecked: z.coerce.date(),
});

export type IncompleteFile = z.infer<typeof fileSchema>;

export const SettingSchema = z.object({
	emptyContentHeading: z.boolean().default(true),
	incompleteSyntax: z.boolean().default(true),
	ignoreFoldersString: z.string().default(""),
	incompleteFiles: fileSchema.array().default([]),
});
