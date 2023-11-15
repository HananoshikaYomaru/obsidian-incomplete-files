import { writeFileSync, readFileSync } from "node:fs";

const typeOnlyModules = ["obsidian"];

for (const module of typeOnlyModules) {
	writeFileSync(`./node_modules/${module}/index.mjs`, "export default {}");

	const packagejson = JSON.parse(
		readFileSync(`./node_modules/${module}/package.json`)
	);

	// add index to package json
	packagejson.main = "index.mjs";

	writeFileSync(
		`./node_modules/${module}/package.json`,
		JSON.stringify(packagejson, null, "\t")
	);
}
