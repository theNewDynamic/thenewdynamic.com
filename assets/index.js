import "./js/polyfills.js"; //MUST GO AT TOP
import "./js/lazysizes.js";
import "./js/quicklink.js";
import "alpinejs";
import "./js/nojs.js";

// const config = {
// 	root: null, // avoiding 'root' or setting it to 'null' sets it to default value: viewport
// 	rootMargin: "200px",
// 	threshold: 0.5,
// };

let isLeaving = false;

//const altheading = document.querySelectorAll("altheading");

// if (!!window.IntersectionObserver) {
// 	let observer = new IntersectionObserver(function (entries) {
// 		entries.forEach((entry) => {
// 			if (entry.isIntersecting) {
// 				console.log("isIntersecting", entry);

// 				isLeaving = true;
//         document.querySelectorAll("headings").style.display = "block";
// 				//entry.classList.add('bg-red-700')
// 				//observer.unobserve(entry.target);
// 			} else if (isLeaving) {
// 				console.log("isleaving", entry);

// 				isLeaving = false;
// 			}
// 		});
// 	}, config);

// } else document.querySelector("#warning").style.display = "block";

const config = {
	rootMargin: "50px 20px 75px 30px",
	threshold: [0, 0.25, 0.75, 1],
};

const heading = document.querySelectorAll(".pageheading");


let observer = new IntersectionObserver((entries) => {
	entries.forEach((entry) => {
		const target = entry.target.nextElementSibling;
	
		console.log("inf", target);
		if (entry.intersectionRatio > 0) {
			target.classList.add('opacity-0');			
		} else {
			target.classList.remove("opacity-0");			
		}
	});
});

heading.forEach((heading) => {
	observer.observe(heading);
});
