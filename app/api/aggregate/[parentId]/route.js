import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";

export async function GET(request, { params }) {
	try {
		const { parentId } = await params;
		const { searchParams } = new URL(request.url);
		const parentCollection = searchParams.get("parentCollection");
		const childCollection = searchParams.get("childCollection");

		if (!parentCollection || !childCollection) {
			return NextResponse.json(
				{
					success: false,
					error:
						"parentCollection and childCollection query parameters are required"
				},
				{ status: 400 }
			);
		}

		// Try to parse as number
		let searchId = isNaN(parentId) ? parentId : parseInt(parentId);

		const collection = await getCollection(parentCollection);

		// Use aggregation pipeline with $lookup
		const result = await collection
			.aggregate([
				{ $match: { _id: searchId } },
				{
					$lookup: {
						from: childCollection,
						localField: "children",
						foreignField: "_id",
						as: "relatedChildren"
					}
				}
			])
			.toArray();

		if (result.length === 0) {
			return NextResponse.json(
				{ success: false, error: "Parent document not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			result: result[0]
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
