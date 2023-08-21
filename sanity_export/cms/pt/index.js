
const fs = require("fs");
const parseObject = require('./parseObject')
const filepath = "./sanity_export/public/index.json"

function jsonReader(filePath, cb) {
  fs.readFile(filePath, (err, fileData) => {
    if (err) {
      return cb && cb(err);
    }
    try {
      const object = JSON.parse(fileData);
      return cb && cb(null, object);
    } catch (err) {
      return cb && cb(err);
    }
  });
}

console.log(`We're starting the portable text migration...`)
const time_message = "Took..."
console.time(time_message);
function gauge(current, max) {
  if(current == max / 4) {
    console.log('...25%')
  }
  if(current == max / 2) {
    console.log('...50%')
  }
  if(current == max - (max / 4)) {
    console.log('...75%')
  }
  if(current == max - 1) {
    console.log('...100%')
  }
}

if(false) {
  test_parse = {
    bodyHTML: `<p>hello</p>`,
    title: 'Hello world',
    header: {
      bodyHTML: `<span>damn</span>`
    },
    blocks: [
      {
        _type: "stateSection",
        copyHTML: `<h2>title here</h2>`
      }
    ]
  }
  console.log(parseObject(test_parse))
  return;
}

jsonReader(filepath, (err, data) => {
  if (err) {
    console.log("Error reading file:", err);
    return;
  }
  const output = data.map((item, index) => {
    gauge(index, data.length)
    return parseObject(item)
  })
  fs.writeFile(filepath, JSON.stringify(output), err => {
    console.log(`Done!`)
    console.timeEnd(time_message);
    if (err) console.log("Error writing file:", err);
  });
});