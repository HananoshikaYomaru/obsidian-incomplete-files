import {
	isHighlightingBecauseClickingIssue,
	detailsStates,
} from "@/ui/helpers/store";
import { isElementInView } from "@/util/isElementInView";

/**
 * this function will scroll to the element and highlight it in the incomplete files view
 */
export function scrollToElement(filePath: string) {
	const element = document.getElementById(
		filePath
	) as HTMLDetailsElement | null;
	const incompleteFilesContainer = document.querySelector(
		`div[data-type="incomplete-files-view"] div.view-content`
	) as HTMLDivElement | null;

	if (!element || !incompleteFilesContainer) {
		isHighlightingBecauseClickingIssue.set(false);
		return;
	}

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

	// open the folder details element and the file details element using the get(DetailsStates) store
	detailsStates.update((detailsStatesValue) => {
		const folderPath = filePath.split("/").slice(0, -1).join("/");
		detailsStatesValue[folderPath] = true;
		detailsStatesValue[filePath] = true;
		return detailsStatesValue;
	});

	isHighlightingBecauseClickingIssue.set(false);
}
