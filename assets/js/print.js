var printButton = document.querySelectorAll(".print_button");

printButton.forEach(function (elem) {
	elem.addEventListener("click", function (_event) {
        elem.innerHTML = "Printed";
        window.print();
        return false;	
	});
});
