export function isElementInView(element: HTMLElement, container: HTMLElement) {
	const elementRect = element.getBoundingClientRect();
	const containerRect = container.getBoundingClientRect();

	return (
		elementRect.top >= containerRect.top &&
		elementRect.bottom <= containerRect.bottom &&
		elementRect.left >= containerRect.left &&
		elementRect.right <= containerRect.right
	);
}
