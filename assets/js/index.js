var h = document.getElementById('navBar')
// var readout = document.getElementById('readout')
var stuck = false
var stickPoint = -550 // getDistance()

function getDistance () {
  var topDist = h.offsetTop
  return topDist
}
if (document.getElementById('navBar')) {
  window.onscroll = function (e) {
    var distance = getDistance() - window.pageYOffset
    var offset = window.pageYOffset
    // readout.innerHTML = 'stickpoint' + stickPoint + ' distance  ' + distance + ' offset ' + offset + ' stuck  ' + stuck
    if ((distance <= stickPoint) && !stuck) {
      h.style.display = 'block'
      h.style.position = 'fixed'
      h.style.top = '0px'
      stuck = true
    } else if (stuck && (offset <= -1 * stickPoint)) {
      h.style.display = 'none'
      h.style.position = 'static'
      stuck = false
    }
  }
}
