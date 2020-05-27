const heading = document.getElementById("pageheading");

let observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
        // The target is the div AFTER the heading. 
		const target = entry.target.nextElementSibling;			
		if (entry.intersectionRatio > 0) {
			target.classList.add('opacity-0');			
		} else {
			target.classList.remove("opacity-0");			
		}
	});
});

observer.observe(heading);