import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";

export async function PUT(request, { params }) {
	try {
		const { name } = await params;
		const body = await request.json();
		const { id, action, value } = body;

		const collection = await getCollection(name);

		// Try to parse as number, fallback to string
		let searchId = isNaN(id) ? id : parseInt(id);

		let updateResult;

		if (action === "addScoreArray") {
			// Task 3: Add Score array to document with 5 ones
			updateResult = await collection.updateOne(
				{ _id: searchId },
				{ $set: { Score: [1, 1, 1, 1, 1] } }
			);
		} else if (action === "insertIntoScore") {
			// Task 4: Conditional array logic
			// If _id == 1, insert 5 into third position
			// Else insert 6 into fourth position

			if (searchId === 1) {
				// Insert 5 into third position (index 2)
				updateResult = await collection.updateOne(
					{ _id: searchId },
					{
						$push: {
							Score: {
								$each: [5],
								$position: 2
							}
						}
					}
				);
			} else {
				// Insert 6 into fourth position (index 3)
				updateResult = await collection.updateOne(
					{ _id: searchId },
					{
						$push: {
							Score: {
								$each: [6],
								$position: 3
							}
						}
					}
				);
			}
		} else if (action === "multiplyScore") {
			// Task 5: Multiply every element by 20 using aggregation pipeline
			updateResult = await collection.updateOne({ _id: searchId }, [
				{
					$set: {
						Score: {
							$map: {
								input: "$Score",
								as: "s",
								in: { $multiply: ["$$s", 20] }
							}
						}
					}
				}
			]);
		} else if (action === "customUpdate") {
			// Generic update with custom fields
			updateResult = await collection.updateOne(
				{ _id: searchId },
				{ $set: value }
			);
		} else {
			return NextResponse.json(
				{ success: false, error: "Invalid action" },
				{ status: 400 }
			);
		}

		if (updateResult.matchedCount === 0) {
			return NextResponse.json(
				{ success: false, error: "Document not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Document updated successfully",
			matchedCount: updateResult.matchedCount,
			modifiedCount: updateResult.modifiedCount
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
