const fs = require("fs");
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
check_duplicated_ids = (data) => {
  data.map(document => {
    const duplicate = data.find(_document => (document._id == _document._id && document != _document))
    if(duplicate) {
      console.log(`${document._id} of type ${document._type} has a duplicate`)
    }
  })
}

check_relationships = (data) => {
  data.map(document => {
    let fields = [
      'taxonomyEventType',
      'taxonomySection',
      'taxonomySubjects',
      'taxonomySubject',
      'sponsors',
      'venue',
    ]
    if(document._type != "book") {
      fields.forEach(field => {
        if(typeof document[field] !== "undefined") {
          let field_value = document[field]
          if(!Array.isArray(field_value)) {
            field_value = [field_value]
          }
          field_value.map(value => {
            const found = data.find(document => document._id == value._ref)
            if(!found) {
              console.log(`${document.title} of type ${document._type} has a broken reference on field ${field} for ${value._ref}`)
            }
          })
        }
      })
  
      /*  
        Production credits is a bit different as the relationships are nested inside an array entry under `staffMembers`.
      */
      if(typeof document.production_credits !== "undefined") {
        document.production_credits.map(credit => {
          credit.staffMembers.map(member => {
            const found = data.find(item => item._id == member._ref)
            //console.log(found)
            if(!found){
              console.log(`${document.title} of type ${document._type} has a broken reference on field production_credits.staffMembers for ${member._ref}`)
            }
          })
        })
      }
    }
    
  })
}

jsonReader(filepath, (err, data) => {
  if (err) {
    console.log("Error reading file:", err);
    return;
  }
  check_relationships(data)
  check_duplicated_ids(data)
  
});