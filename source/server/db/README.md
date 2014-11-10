Create a Backup:
mongodump --host localhost --port 27017 -o <path of backup>

Restore a Backup
mongorestore --localhost --port 27017 <path of backup>