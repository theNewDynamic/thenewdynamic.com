const pageHeading = document.querySelectorAll("#pageheading");

let observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		// The target is the div AFTER the heading.
		const target = entry.target.nextElementSibling;
		if (entry.intersectionRatio > 0) {
			target.classList.add("opacity-0");
		} else {
			target.classList.remove("opacity-0");
		}
	});
});

pageHeading.forEach((heading) => {
	observer.observe(heading);
});
