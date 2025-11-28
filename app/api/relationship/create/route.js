import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";

export async function PUT(request) {
	try {
		const body = await request.json();
		const {
			type,
			parentCollection,
			parentId,
			childCollection,
			childIds,
			embeddedDocuments
		} = body;

		if (!parentCollection || !parentId) {
			return NextResponse.json(
				{ success: false, error: "parentCollection and parentId are required" },
				{ status: 400 }
			);
		}

		const parentColl = await getCollection(parentCollection);
		let searchId = isNaN(parentId) ? parentId : parseInt(parentId);
		let result;

		if (type === "embedded") {
			// Embedded Documents: Store child documents inside parent
			if (!embeddedDocuments || !Array.isArray(embeddedDocuments)) {
				return NextResponse.json(
					{
						success: false,
						error: "embeddedDocuments array is required for embedded type"
					},
					{ status: 400 }
				);
			}

			result = await parentColl.updateOne(
				{ _id: searchId },
				{ $set: { embedded_items: embeddedDocuments } }
			);
		} else if (type === "reference-parent") {
			// Reference: Parent has array of child IDs
			if (!childIds || !Array.isArray(childIds)) {
				return NextResponse.json(
					{
						success: false,
						error: "childIds array is required for reference-parent type"
					},
					{ status: 400 }
				);
			}

			let childIdsArray = childIds.map((id) => (isNaN(id) ? id : parseInt(id)));

			result = await parentColl.updateOne(
				{ _id: searchId },
				{ $set: { children: childIdsArray } }
			);
		} else if (type === "reference-child") {
			// Reference: Children have parent ID
			if (!childCollection || !childIds || !Array.isArray(childIds)) {
				return NextResponse.json(
					{
						success: false,
						error:
							"childCollection and childIds are required for reference-child type"
					},
					{ status: 400 }
				);
			}

			const childColl = await getCollection(childCollection);
			let childIdsArray = childIds.map((id) => (isNaN(id) ? id : parseInt(id)));

			// Update all child documents to have parent_id
			result = await childColl.updateMany(
				{ _id: { $in: childIdsArray } },
				{ $set: { parent_id: searchId } }
			);
		} else {
			return NextResponse.json(
				{ success: false, error: "Invalid relationship type" },
				{ status: 400 }
			);
		}

		if (result.matchedCount === 0) {
			return NextResponse.json(
				{ success: false, error: "Document(s) not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: `One-to-many relationship (${type}) created successfully`,
			matchedCount: result.matchedCount,
			modifiedCount: result.modifiedCount
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
