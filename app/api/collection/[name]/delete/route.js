import { NextResponse } from "next/server";
import { getCollection } from "@/lib/mongo";

export async function DELETE(request, { params }) {
	try {
		const { name } = await params;
		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json(
				{ success: false, error: "ID is required" },
				{ status: 400 }
			);
		}

		const collection = await getCollection(name);

		// Try to parse as number, fallback to string
		let searchId = isNaN(id) ? id : parseInt(id);

		const result = await collection.deleteOne({ _id: searchId });

		if (result.deletedCount === 0) {
			return NextResponse.json(
				{ success: false, error: "Document not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "Document deleted successfully",
			deletedCount: result.deletedCount
		});
	} catch (error) {
		return NextResponse.json(
			{ success: false, error: error.message },
			{ status: 500 }
		);
	}
}
