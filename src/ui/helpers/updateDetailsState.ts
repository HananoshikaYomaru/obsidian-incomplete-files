import { get } from "svelte/store";
import { detailsStates, areSummariesExpanded } from "./store";

export function updateDetailsState(
	path: string,
	event: Event<EventTarget> & {
		currentTarget: EventTarget & HTMLDetailsElement;
	}
) {
	detailsStates.update((state) => {
		// @ts-ignore
		state[path] = event.target?.open;
		return state;
	});
	// this will change the state of the details element
	areSummariesExpanded.set(
		Object.values(get(detailsStates)).some((state) => state)
	);
}
