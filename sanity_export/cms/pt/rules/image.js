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

    if (el.tagName.toLowerCase() != 'img') {
      return undefined
    }
    let src = el.getAttribute("src")
    let public
    let caption = ''
    if(src.includes('http') ){
      public = src
    } else {
      src = src.replace('/uploads', '') 
      public = `https://www.thenewdynamic.com${src}`
    }
    if(el.getAttribute("data-caption")) {
      caption = el.getAttribute("data-caption")
    }
    return block({
      _type: "image",
      _sanityAsset: `image@${public}`,
      caption,
    })
  },
}