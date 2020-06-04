// Search Form Functionality
function modalSearch() {
	const body = document.body;
	const searchBox = document.getElementById("searchbox");
	return {
		isOpen: false,
		open() {
			(this.isOpen = true),
				// relative assists absolute positioning of search modal
				// over-flow-hidden keeps body from scrolling when modal active
				body.classList.add("relative", "overflow-hidden"),
				// setTimeout is required for focus to work on Chromium
				setTimeout(() => {
					// focus/selects puts the cursor in the search form on initiation.
					searchBox.focus();
					searchBox.select();
				}, 100);
		},
		close() {
			(this.isOpen = false),
				body.classList.remove("relative", "overflow-hidden");
		},
	};
}
// END Search Form Functionality

console.log('search',searchBox )