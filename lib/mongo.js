import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "assignment_db";

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
	if (cachedClient && cachedDb) {
		return { client: cachedClient, db: cachedDb };
	}

	const client = await MongoClient.connect(uri);

	const db = client.db(dbName);

	cachedClient = client;
	cachedDb = db;

	return { client, db };
}

export async function getCollection(collectionName) {
	const { db } = await connectToDatabase();
	return db.collection(collectionName);
}
