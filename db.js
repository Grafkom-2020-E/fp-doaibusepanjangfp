//init db
const db = firebase.firestore();
let coordinates = {};
let profiles = {};

db.enablePersistence().catch( err => {
    if (err.code === 'unimplemented'){
        console.log('persistence is not available');
    }
})

db.collection("koordinat")
    .onSnapshot(function(querySnapshot) {
        // let maxTime = Number.MAX_SAFE_INTEGER, next_x, next_y;
        querySnapshot.forEach(function(doc) {
            console.log(doc.data());
            Object.values(doc.data()).forEach(coordinate => {
              if (!coordinates[doc.id]) {
                coordinates[doc.id] = { x: [], y: []};
              }

              coordinates[doc.id].x.push(coordinate.x);
              coordinates[doc.id].y.push(coordinate.y);
            })
        });
    });

db.collection("profile")
    .onSnapshot(function(querySnapshot) {
        // let maxTime = Number.MAX_SAFE_INTEGER, next_x, next_y;
        querySnapshot.forEach(function(doc) {
            // console.log(doc.id  + ":" + doc.data());
            profiles[doc.id] = doc.data();
        });
    });