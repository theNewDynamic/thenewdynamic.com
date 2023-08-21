function getVideoIdFromUrl(url) {
  var regex = /youtube\.com\/embed\/([\w-]+)/;
  var match = url.match(regex);

  if (match && match.length >= 2) {
    return match[1];
  } else {
    // Invalid URL or format
    return null;
  }
}

module.exports = {
  deserialize(el, next, block) {
    if(typeof el.tagName == "undefined") {
      return undefined
    }
    if (el.tagName.toLowerCase() !== 'iframe') {
      return undefined
    }
    let url = el.getAttribute("src") || false
    if(url) {
      if(getVideoIdFromUrl(url)) {
        return block({
          _type: "blockVideo",
          id: getVideoIdFromUrl(url)
        })
      }
    }
    const html = el.outerHTML
    return block({
      _type: 'blockHTML',
      html
    })
  },
}