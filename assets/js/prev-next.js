const prevElem = document.querySelector('[data-previous]')
const nextElem = document.querySelector('[data-next]')
document.body.onkeyup = function(e){
  if (prevElem) {
    if (e.keyCode == '37') { window.location = prevElem.getAttribute('data-previous') }
  }
  if (nextElem) {
    if (e.keyCode == '39') { window.location = nextElem.getAttribute('data-next') }
  }
};