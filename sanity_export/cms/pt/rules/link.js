/**
What We want to return
{
  _type: image
  _sanityAsset: image@https://www.joinproviders.com/uploads/blog-tax-safe-graphic.jpg
}
 */

module.exports = {
  deserialize(el, next, block) {
    if(typeof el.tagName == "undefined") {
      return undefined
    }

    if (el.tagName.toLowerCase() != 'a') {
      return undefined
    }
    let public
    const href = el.getAttribute("href")
    if(!href.startsWith('/uploads/') ){
      return undefined
    } else {
      public = `https://www.thenewdynamic.com${href}`
    }
    return block({
      _type: "file",
      _sanityAsset: `file@${public}`,
    })
  },
}