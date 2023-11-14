import { Notice } from "obsidian";

export const createNotice = (
	message: string | DocumentFragment,
	duration?: number | undefined
): Notice => new Notice(`Incomplete files: ${message}`, duration);
