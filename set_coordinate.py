import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import time
import sys

def upload_data(document, x, y):
  data = {
    str(time.time()).replace('.', '') : {
      u'x': x,
      u'y': y,
    }
  }

  try:
    db.collection(u'koordinat').document(document).update(data)
  except:
    db.collection(u'koordinat').document(document).set(data)


# Use the application default credentials
cred = credentials.Certificate('grafkom-732e0-53476ca79794.json')
firebase_admin.initialize_app(cred, {
  'projectId': 'grafkom-732e0',
})

db = firestore.client()

# upload_data('natih', 9.0, 10.2)
upload_data(sys.argv[1], float(sys.argv[2]), float(sys.argv[3]))