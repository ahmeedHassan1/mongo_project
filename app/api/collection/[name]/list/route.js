import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";

export async function GET(request, { params }) {
	try {
		const { name } = await params;
		const collection = await getCollection(name);

		const documents = await collection.find({}).toArray();

		return NextResponse.json({
			success: true,
			documents
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
