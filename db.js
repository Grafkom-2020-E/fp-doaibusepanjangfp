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
        querySnapshot.forEach(function(doc) {
            // console.log(doc.id  + ":" + doc.data());
            coordinates[doc.id] = doc.data()
        });
    });