<script lang="ts">
	import { INCOMPLETE_ISSUE_TYPE } from "@/rules/issueScanners";
	import { checkEmptyContent } from "@/rules/checkEmptyContent";
	import { checkEmptyContentHeading } from "@/rules/checkEmptyContentHeading";
	import { checkIncompleteSyntax } from "@/rules/checkIncompleteSyntax";
	import { goToFile } from "@/ui/helpers/goToFile";
	import { goToHeading } from "@/ui/helpers/goToHeading";
	import type { Issue } from "@/ui/helpers/store";
	import { ButtonComponent } from "obsidian";

	export let issue: Issue;

	function useButtonAction(node: HTMLElement, issue: Issue) {
		// Initialize button logic here
		const button = new ButtonComponent(node);
		button.setTooltip(`${issue.file.path}: ${issue.title}`);

		// Set up the button's click action
		button.onClick(() => {
			if (issue.heading) goToHeading(issue.file, issue.heading);
			else goToFile(issue.file);
		});

		// Function to update the button's content
		function updateIcon() {
			button.buttonEl.innerHTML =
				issue.type === INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT
					? checkEmptyContent.icon
					: issue.type === INCOMPLETE_ISSUE_TYPE.EMPTY_CONTENT_HEADING
					? checkEmptyContentHeading.icon
					: checkIncompleteSyntax.icon;
			button.buttonEl.dataset.issue = issue.type;
			button.buttonEl.classList.add(
				"is-clickable",
				"incomplete-files-issue",
				"issue-icon"
			);
		}

		updateIcon();

		return {
			update(newIssue: Issue) {
				// This function is called with the new value whenever the value changes
				issue = newIssue;
				updateIcon();
			},
			destroy() {
				// Clean up the button when the element is removed
				button.buttonEl.remove();
			},
		};
	}
</script>

<div style="display:inline-block;" use:useButtonAction={issue}>
	<!-- {@html } -->
</div>
