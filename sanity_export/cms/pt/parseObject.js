const generatePortableText = require('./generatePortableText')

const parseObject = (theObject) => {
  if(Array.isArray(theObject)){
    return theObject.map(item => (parseObject(item)))
  } else if (typeof theObject == "object") {
    let output = {}
    for (const property in theObject) {
      if(property.endsWith('HTML')) {
        output[property.replace("HTML", '')] = generatePortableText(theObject[property])
      } else {
        output[property] = parseObject(theObject[property])
      }
    }
    return output
  } else {
    return theObject
  }
}

module.exports = parseObject