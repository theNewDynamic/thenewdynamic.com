module.exports = {
  deserialize(el, next, block) {
    if(typeof el.tagName == "undefined") {
      return undefined
    }
    if (el.id !== 'shortcode') {
      return undefined
    }
    parameters = JSON.parse(el.innerHTML)
    return block(parameters)
  },
}