export function formatDate(date: Date) {
	// the formart of YYYY-MM-DD
	return date.toISOString().split("T")[0];
}
