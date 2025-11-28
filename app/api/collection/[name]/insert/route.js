import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";

export async function POST(request, { params }) {
	try {
		const { name } = await params;
		const body = await request.json();
		const { documents, single } = body;

		const collection = await getCollection(name);

		let result;
		if (single) {
			// Insert single document
			result = await collection.insertOne(documents);
		} else {
			// Insert multiple documents
			result = await collection.insertMany(documents);
		}

		return NextResponse.json({
			success: true,
			message: single
				? "Document inserted successfully"
				: "Documents inserted successfully",
			result: {
				acknowledged: result.acknowledged,
				insertedCount: single ? 1 : result.insertedCount,
				insertedIds: single
					? [result.insertedId]
					: Object.values(result.insertedIds)
			}
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
