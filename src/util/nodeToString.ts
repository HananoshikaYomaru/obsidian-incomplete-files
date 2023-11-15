import { type Node, type Text } from "mdast";

// Utility function to convert node to string
export function nodeToString(node: Node): string {
	if (node.type === "text") return (node as Text).value;
	// @ts-ignore
	if (node.children) return node.children.map(nodeToString).join("");
	return "";
}
