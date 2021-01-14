//init db
const db = firebase.firestore();
let coordinates = {};

db.enablePersistence().catch( err => {
    if (err.code === 'unimplemented'){
        console.log('persistence is not available');
    }
})

db.collection("koordinat")
    .onSnapshot(function(querySnapshot) {
        // let maxTime = Number.MAX_SAFE_INTEGER, next_x, next_y;
        let newCoordinates = {};
        querySnapshot.forEach(function(doc) {
            const orderedCoordinates = Object.keys(doc.data()).sort().reduce((r, k) => ((r[k] = doc.data()[k], r)), {});
            console.log(orderedCoordinates);
            Object.values(orderedCoordinates).forEach(coordinate => {
              if (!newCoordinates[doc.id]) {
                newCoordinates[doc.id] = { x: [], y: []};
              }

              newCoordinates[doc.id].x.push(coordinate.x);
              newCoordinates[doc.id].y.push(coordinate.y);
            })
        });
        coordinates = newCoordinates;
    });

// db.collection("profile")
//     .onSnapshot(function(querySnapshot) {
//         // let maxTime = Number.MAX_SAFE_INTEGER, next_x, next_y;
//         querySnapshot.forEach(function(doc) {
//             // console.log(doc.id  + ":" + doc.data());
//             profiles[doc.id] = doc.data();
//         });
//     });