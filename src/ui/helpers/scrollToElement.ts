import { preventHighlight } from "@/ui/helpers/store";
import { isElementInView } from "@/util/isElementInView";
import { get } from "svelte/store";

export function scrollToElement(filePath: string) {
	const element = document.getElementById(filePath) as HTMLDetailsElement;
	const incompleteFilesContainer = document.querySelector(
		`div[data-type="incomplete-files-view"] div.view-content`
	) as HTMLDivElement;

	if (element && incompleteFilesContainer && !get(preventHighlight)) {
		element.scrollIntoView();
		const offset = 100; // Adjust this value as needed
		incompleteFilesContainer.scrollBy(0, -offset);

		// if element is not in the view, scroll into view again
		if (!isElementInView(element, incompleteFilesContainer)) {
			element.scrollIntoView();
		}

		// Highlight the element
		element.classList.add("highlight");
		setTimeout(() => element.classList.remove("highlight"), 2000); // Remove highlight after 2 seconds
	}
	preventHighlight.set(false);
}
