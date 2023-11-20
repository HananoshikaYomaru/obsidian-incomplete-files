export function isElementInView(element: HTMLElement, container: HTMLElement) {
	const elementRect = element.getBoundingClientRect();
	const containerRect = container.getBoundingClientRect();

	// Check if the element is within the horizontal bounds of the container
	if (
		elementRect.left < containerRect.left ||
		elementRect.right > containerRect.right
	) {
		return false;
	}

	// Calculate the vertical overlap
	const topOverlap = Math.max(0, containerRect.bottom - elementRect.top);
	const bottomOverlap = Math.max(0, elementRect.bottom - containerRect.top);
	const verticalOverlap = Math.min(topOverlap, bottomOverlap);

	// Calculate the height of the visible portion of the element within the container
	const visibleHeight = Math.min(verticalOverlap, elementRect.height);

	// Check if at least 50% of the container's height is occupied by the element
	return (
		visibleHeight >= containerRect.height * 0.5 ||
		visibleHeight === elementRect.height
	);
}

export function isFileInView(filePath: string) {
	const element = document.getElementById(
		filePath
	) as HTMLDetailsElement | null;
	const incompleteFilesContainer = document.querySelector(
		`div[data-type="incomplete-files-view"] div.view-content`
	) as HTMLDivElement | null;

	if (!element || !incompleteFilesContainer) {
		// this is possible because when the incomplete files view is not open.
		return;
	}

	return isElementInView(element, incompleteFilesContainer);
}
