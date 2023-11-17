/// <reference types="vitest" />

import { defineConfig } from "vite";
import TsConfigPath from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [TsConfigPath()],
	test: {
		watch: false,
		globals: true,
	},
});
