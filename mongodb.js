// mongodb.js
const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

let db;

async function connectMongo() {
  if (!db) {
    await client.connect();
    db = client.db('empresa_db');
    console.log('[MongoDB] Conectado a empresa_db');
  }
  return db;
}

module.exports = { connectMongo };
