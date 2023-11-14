import { z } from "zod";

export const SettingSchema = z.object({
	emptyContentHeading: z.boolean().default(true),
	incompleteSyntax: z.boolean().default(true),
	ignoreFoldersString: z.string().default(""),
});
