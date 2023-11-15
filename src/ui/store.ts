import { writable } from "svelte/store";
import IncompleteFilesPlugin from "@/main";
import type { IncompleteFile } from "@/SettingsSchemas";

export const plugin = writable<IncompleteFilesPlugin>();
export const incompleteFiles = writable<IncompleteFile[]>([]);
