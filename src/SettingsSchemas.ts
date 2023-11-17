import { z } from "zod";
import { INCOMPLETE_ISSUE_TYPE } from "@/rules/INCOMPLETE_ISSUE_TYPE";

const headingSchema = z.object({
	depth: z.number().min(1).max(6),
	text: z.string(),
});

export type Heading = z.infer<typeof headingSchema>;

const issueSchema = z.object({
	type: z.nativeEnum(INCOMPLETE_ISSUE_TYPE),
	/**
	 * e.g. "(INCOMPLETE_SYNTAX) H2 - What is it? "
	 */
	title: z.string(),
	/**
	 * if the issue has corresponding a heading
	 */
	heading: headingSchema.optional(),
});

export type RawIssue = z.infer<typeof issueSchema>;

const fileSchema = z.object({
	/**
	 * the unique identifier of the file
	 */
	hash: z.string(),
	path: z.string(),
	basename: z.string(),
	issues: issueSchema.array(),
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
