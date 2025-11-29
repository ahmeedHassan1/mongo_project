"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
	const [insertData, setInsertData] = useState({
		collection: "students",
		_id: "",
		fields: ""
	});

	const [deleteData, setDeleteData] = useState({
		collection: "students",
		id: ""
	});

	const [updateData, setUpdateData] = useState({
		collection: "students",
		id: "",
		action: "addScoreArray"
	});

	const [relationshipData, setRelationshipData] = useState({
		type: "reference-parent",
		parentCollection: "students",
		childCollection: "courses",
		parentId: "",
		childIds: "",
		embeddedData: ""
	});

	const [aggregateData, setAggregateData] = useState({
		parentCollection: "students",
		childCollection: "courses",
		parentId: ""
	});

	const [response, setResponse] = useState(null);
	const [loading, setLoading] = useState(false);
	const [documentsA, setDocumentsA] = useState([]);
	const [documentsB, setDocumentsB] = useState([]);

	// Fetch documents from collection
	const fetchDocuments = async (collectionName) => {
		try {
			const res = await fetch(`/api/collection/${collectionName}/list`);
			const data = await res.json();

			if (data.success) {
				if (collectionName === "students") {
					setDocumentsA(data.documents);
				} else {
					setDocumentsB(data.documents);
				}
				toast.success(`Fetched ${collectionName} documents`);
			}
		} catch (error) {
			toast.error("Failed to fetch documents");
		}
	};

	// Task 1: Insert Documents
	const handleInsert = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			let parsedFields = {};
			if (insertData.fields) {
				parsedFields = JSON.parse(insertData.fields);
			}

			const document = {
				_id: isNaN(insertData._id) ? insertData._id : parseInt(insertData._id),
				...parsedFields
			};

			const res = await fetch(
				`/api/collection/${insertData.collection}/insert`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						documents: document,
						single: true
					})
				}
			);

			const data = await res.json();
			setResponse(data);

			if (data.success) {
				toast.success("Document inserted successfully!");
				setInsertData({ ...insertData, _id: "", fields: "" });
				fetchDocuments(insertData.collection);
			} else {
				toast.error(data.error || "Failed to insert");
			}
		} catch (error) {
			toast.error("Error: " + error.message);
			setResponse({ error: error.message });
		} finally {
			setLoading(false);
		}
	};

	// Task 2: Delete Document
	const handleDelete = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await fetch(
				`/api/collection/${deleteData.collection}/delete?id=${deleteData.id}`,
				{ method: "DELETE" }
			);

			const data = await res.json();
			setResponse(data);

			if (data.success) {
				toast.success("Document deleted successfully!");
				setDeleteData({ ...deleteData, id: "" });
				fetchDocuments(deleteData.collection);
			} else {
				toast.error(data.error || "Failed to delete");
			}
		} catch (error) {
			toast.error("Error: " + error.message);
			setResponse({ error: error.message });
		} finally {
			setLoading(false);
		}
	};

	// Tasks 3, 4, 5: Update Documents with Score Logic
	const handleUpdate = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await fetch(
				`/api/collection/${updateData.collection}/update`,
				{
					method: "PUT",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						id: isNaN(updateData.id) ? updateData.id : parseInt(updateData.id),
						action: updateData.action
					})
				}
			);

			const data = await res.json();
			setResponse(data);

			if (data.success) {
				toast.success("Document updated successfully!");
				fetchDocuments(updateData.collection);
			} else {
				toast.error(data.error || "Failed to update");
			}
		} catch (error) {
			toast.error("Error: " + error.message);
			setResponse({ error: error.message });
		} finally {
			setLoading(false);
		}
	};

	// Task 6: Create Relationship
	const handleCreateRelationship = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			let requestBody = {
				type: relationshipData.type,
				parentCollection: relationshipData.parentCollection,
				parentId: isNaN(relationshipData.parentId)
					? relationshipData.parentId
					: parseInt(relationshipData.parentId)
			};

			if (relationshipData.type === "embedded") {
				// Parse embedded documents JSON array
				const embeddedDocs = JSON.parse(relationshipData.embeddedData);
				requestBody.embeddedDocuments = embeddedDocs;
			} else {
				// For reference types
				const childIdsArray = relationshipData.childIds
					.split(",")
					.map((id) => id.trim());
				requestBody.childCollection = relationshipData.childCollection;
				requestBody.childIds = childIdsArray;
			}

			const res = await fetch("/api/relationship/create", {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(requestBody)
			});

			const data = await res.json();
			setResponse(data);

			if (data.success) {
				toast.success("Relationship created successfully!");
				fetchDocuments(relationshipData.parentCollection);
				if (relationshipData.type === "reference-child") {
					fetchDocuments(relationshipData.childCollection);
				}
			} else {
				toast.error(data.error || "Failed to create relationship");
			}
		} catch (error) {
			toast.error("Error: " + error.message);
			setResponse({ error: error.message });
		} finally {
			setLoading(false);
		}
	};

	// Task 7: Aggregate with $lookup
	const handleAggregate = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await fetch(
				`/api/aggregate/${aggregateData.parentId}?parentCollection=${aggregateData.parentCollection}&childCollection=${aggregateData.childCollection}`
			);

			const data = await res.json();
			setResponse(data);

			if (data.success) {
				toast.success("Aggregation completed!");
			} else {
				toast.error(data.error || "Failed to aggregate");
			}
		} catch (error) {
			toast.error("Error: " + error.message);
			setResponse({ error: error.message });
		} finally {
			setLoading(false);
		}
	};

	return (
		<main className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
			<div className="max-w-7xl mx-auto">
				{/* Collection Viewers - Sticky at Top */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
					<div className="bg-white rounded-lg shadow-lg p-4">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-lg font-semibold text-indigo-800">
								📋 Students
							</h3>
							<button
								onClick={() => fetchDocuments("students")}
								className="bg-indigo-600 text-white py-1.5 px-4 rounded-md hover:bg-indigo-700 transition text-sm flex items-center gap-2">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
								Refresh
							</button>
						</div>
						<div className="max-h-64 overflow-y-auto bg-gray-50 rounded p-3 border border-gray-200">
							{documentsA.length > 0 ? (
								<pre className="text-xs text-gray-800">
									{JSON.stringify(documentsA, null, 2)}
								</pre>
							) : (
								<p className="text-gray-400 text-sm text-center py-8">
									No documents yet. Click Refresh to load.
								</p>
							)}
						</div>
						<div className="mt-2 text-xs text-gray-600">
							Total: <span className="font-semibold">{documentsA.length}</span>{" "}
							documents
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-lg p-4">
						<div className="flex items-center justify-between mb-3">
							<h3 className="text-lg font-semibold text-indigo-800">
								📋 Courses
							</h3>
							<button
								onClick={() => fetchDocuments("courses")}
								className="bg-indigo-600 text-white py-1.5 px-4 rounded-md hover:bg-indigo-700 transition text-sm flex items-center gap-2">
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
								Refresh
							</button>
						</div>
						<div className="max-h-64 overflow-y-auto bg-gray-50 rounded p-3 border border-gray-200">
							{documentsB.length > 0 ? (
								<pre className="text-xs text-gray-800">
									{JSON.stringify(documentsB, null, 2)}
								</pre>
							) : (
								<p className="text-gray-400 text-sm text-center py-8">
									No documents yet. Click Refresh to load.
								</p>
							)}
						</div>
						<div className="mt-2 text-xs text-gray-600">
							Total: <span className="font-semibold">{documentsB.length}</span>{" "}
							documents
						</div>
					</div>
				</div>
				{/* Section 1: Create Documents */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-2xl font-semibold text-indigo-800 mb-4">
						1️⃣ Create Documents
					</h2>
					<form onSubmit={handleInsert} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Collection
								</label>
								<select
									value={insertData.collection}
									onChange={(e) =>
										setInsertData({ ...insertData, collection: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
									<option value="students">Students</option>
									<option value="courses">Courses</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Document ID
								</label>
								<input
									type="text"
									value={insertData._id}
									onChange={(e) =>
										setInsertData({ ...insertData, _id: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									placeholder="1"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Additional Fields (JSON)
								</label>
								<input
									type="text"
									value={insertData.fields}
									onChange={(e) =>
										setInsertData({ ...insertData, fields: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
									placeholder='{"name": "John", "age": 25}'
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition disabled:bg-gray-400">
							{loading ? "Inserting..." : "Insert Document"}
						</button>
					</form>
				</div>
				{/* Section 2: Delete Documents */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-2xl font-semibold text-red-800 mb-4">
						2️⃣ Delete Documents
					</h2>
					<form onSubmit={handleDelete} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Collection
								</label>
								<select
									value={deleteData.collection}
									onChange={(e) =>
										setDeleteData({ ...deleteData, collection: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent">
									<option value="students">Students</option>
									<option value="courses">Courses</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Document ID
								</label>
								<input
									type="text"
									value={deleteData.id}
									onChange={(e) =>
										setDeleteData({ ...deleteData, id: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
									placeholder="1"
									required
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition disabled:bg-gray-400">
							{loading ? "Deleting..." : "Delete Document"}
						</button>
					</form>
				</div>
				{/* Section 3: Update Documents (Score Array Logic) */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-2xl font-semibold text-purple-800 mb-4">
						3️⃣4️⃣5️⃣ Update Documents - Score Array Logic
					</h2>
					<form onSubmit={handleUpdate} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Collection
								</label>
								<select
									value={updateData.collection}
									onChange={(e) =>
										setUpdateData({ ...updateData, collection: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
									<option value="students">Students</option>
									<option value="courses">Courses</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Document ID
								</label>
								<input
									type="text"
									value={updateData.id}
									onChange={(e) =>
										setUpdateData({ ...updateData, id: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
									placeholder="1"
									required
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Action
								</label>
								<select
									value={updateData.action}
									onChange={(e) =>
										setUpdateData({ ...updateData, action: e.target.value })
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent">
									<option value="addScoreArray">
										Add Score Array (Task 3)
									</option>
									<option value="insertIntoScore">
										Insert into Score (Task 4)
									</option>
									<option value="multiplyScore">
										Multiply Score by 20 (Task 5)
									</option>
								</select>
							</div>
						</div>

						<div className="bg-purple-50 p-4 rounded-md">
							<p className="text-sm text-purple-900">
								<strong>Task 3:</strong> Adds empty Score array
								<br />
								<strong>Task 4:</strong> If ID=1 → insert 5 at position 3, else
								insert 6 at position 4<br />
								<strong>Task 5:</strong> Multiply all Score elements by 20
							</p>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition disabled:bg-gray-400">
							{loading ? "Updating..." : "Update Document"}
						</button>
					</form>
				</div>
				{/* Section 4: Create One-to-Many Relationship */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-2xl font-semibold text-orange-800 mb-4">
						6️⃣ Create One-to-Many Relationship
					</h2>
					<form onSubmit={handleCreateRelationship} className="space-y-4">
						{/* Relationship Type Selector */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Relationship Type
							</label>
							<select
								value={relationshipData.type}
								onChange={(e) =>
									setRelationshipData({
										...relationshipData,
										type: e.target.value
									})
								}
								className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent">
								<option value="reference-parent">
									Reference - Parent has Child IDs
								</option>
								<option value="reference-child">
									Reference - Child has Parent ID
								</option>
								<option value="embedded">Embedded Documents</option>
							</select>
						</div>

						{/* Info Box */}
						<div className="bg-orange-50 p-4 rounded-md">
							<p className="text-sm text-orange-900">
								{relationshipData.type === "reference-parent" && (
									<>
										<strong>Reference (Parent → Child IDs):</strong> Parent
										document stores array of child IDs.
										<br />
										Example: {`{_id: 1, name: "Parent", children: [7, 8, 9]}`}
									</>
								)}
								{relationshipData.type === "reference-child" && (
									<>
										<strong>Reference (Child → Parent ID):</strong> Child
										documents store parent ID.
										<br />
										Example: {`{_id: 7, name: "Child", parent_id: 1}`}
									</>
								)}
								{relationshipData.type === "embedded" && (
									<>
										<strong>Embedded Documents:</strong> Child documents
										embedded inside parent.
										<br />
										Example: {`{_id: 1, items: [{name: "A"}, {name: "B"}]}`}
									</>
								)}
							</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Parent Collection
								</label>
								<select
									value={relationshipData.parentCollection}
									onChange={(e) =>
										setRelationshipData({
											...relationshipData,
											parentCollection: e.target.value
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent">
									<option value="students">Students</option>
									<option value="courses">Courses</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Parent Document ID
								</label>
								<input
									type="text"
									value={relationshipData.parentId}
									onChange={(e) =>
										setRelationshipData({
											...relationshipData,
											parentId: e.target.value
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
									placeholder="1"
									required
								/>
							</div>
						</div>

						{/* Conditional Fields Based on Type */}
						{relationshipData.type === "embedded" ? (
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Embedded Documents (JSON Array)
								</label>
								<textarea
									value={relationshipData.embeddedData}
									onChange={(e) =>
										setRelationshipData({
											...relationshipData,
											embeddedData: e.target.value
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
									rows="4"
									placeholder='[{"street": "123 Main St", "city": "Boston"}, {"street": "456 Elm St", "city": "NYC"}]'
									required
								/>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Child Collection
									</label>
									<select
										value={relationshipData.childCollection}
										onChange={(e) =>
											setRelationshipData({
												...relationshipData,
												childCollection: e.target.value
											})
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent">
										<option value="students">Students</option>
										<option value="courses">Courses</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Child Document IDs (comma-separated)
									</label>
									<input
										type="text"
										value={relationshipData.childIds}
										onChange={(e) =>
											setRelationshipData({
												...relationshipData,
												childIds: e.target.value
											})
										}
										className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
										placeholder="7, 8, 9"
										required
									/>
								</div>
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition disabled:bg-gray-400">
							{loading ? "Creating..." : "Create Relationship"}
						</button>
					</form>
				</div>
				{/* Section 5: Aggregation Viewer */}
				<div className="bg-white rounded-lg shadow-lg p-6 mb-6">
					<h2 className="text-2xl font-semibold text-teal-800 mb-4">
						7️⃣ Aggregation Viewer ($lookup)
					</h2>
					<form onSubmit={handleAggregate} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Parent Collection
								</label>
								<select
									value={aggregateData.parentCollection}
									onChange={(e) =>
										setAggregateData({
											...aggregateData,
											parentCollection: e.target.value
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent">
									<option value="students">Students</option>
									<option value="courses">Courses</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Child Collection
								</label>
								<select
									value={aggregateData.childCollection}
									onChange={(e) =>
										setAggregateData({
											...aggregateData,
											childCollection: e.target.value
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent">
									<option value="students">Students</option>
									<option value="courses">Courses</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Parent Document ID
								</label>
								<input
									type="text"
									value={aggregateData.parentId}
									onChange={(e) =>
										setAggregateData({
											...aggregateData,
											parentId: e.target.value
										})
									}
									className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent"
									placeholder="10"
									required
								/>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition disabled:bg-gray-400">
							{loading ? "Aggregating..." : "Run Aggregation"}
						</button>
					</form>
				</div>

				{/* Response Viewer */}
				{response && (
					<div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold text-white">
								🔍 API Response
							</h2>
							<button
								onClick={() => setResponse(null)}
								className="text-gray-400 hover:text-white transition">
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<div className="max-h-96 overflow-y-auto">
							<pre className="text-green-400 text-sm">
								{JSON.stringify(response, null, 2)}
							</pre>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
