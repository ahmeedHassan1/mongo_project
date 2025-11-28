# MongoDB Assignment Manager

A complete Next.js application using the App Router that implements all MongoDB CRUD operations, array manipulation, relationships, and aggregation pipelines.

## 🚀 Features

### Part 1 - MongoDB CRUD + Array Logic

- ✅ **Create Collections**: Insert documents into collectionA and collectionB
- ✅ **Delete Documents**: Remove documents by ID from any collection
- ✅ **Update with Score Array**: Add Score array to documents
- ✅ **Conditional Array Logic**:
  - If `_id == 1` → Insert 5 at position 3
  - Else → Insert 6 at position 4
- ✅ **Array Multiplication**: Multiply all Score elements by 20 using `$map` and `$multiply`

### Part 2 - Relationships + Aggregation

- ✅ **One-to-Many Relationships**: Create parent-child document relationships
- ✅ **$lookup Aggregation**: Join related documents using MongoDB aggregation pipeline

## 📦 Installation

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure MongoDB connection:**

   Edit `.env.local` to match your MongoDB setup:

   ```
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=assignment_db
   ```

3. **Start development server:**

   ```bash
   npm run dev
   ```

4. **Open browser:**
   ```
   http://localhost:3000
   ```

## 🏗️ Project Structure

```
mongo_project/
├── app/
│   ├── api/
│   │   ├── collection/
│   │   │   └── [name]/
│   │   │       ├── insert/route.js      # Insert documents
│   │   │       ├── delete/route.js      # Delete documents
│   │   │       ├── update/route.js      # Update with Score logic
│   │   │       └── list/route.js        # List all documents
│   │   ├── relationship/
│   │   │   └── create/route.js          # Create one-to-many
│   │   └── aggregate/
│   │       └── [parentId]/route.js      # $lookup aggregation
│   ├── layout.jsx
│   ├── page.jsx                          # Single-page UI
│   └── globals.css
├── lib/
│   └── mongo.js                          # MongoDB connection helper
├── package.json
├── tailwind.config.js
└── .env.local
```

## 🎯 API Routes

### Insert Documents

```
POST /api/collection/[name]/insert
Body: { documents: {...}, single: true }
```

### Delete Documents

```
DELETE /api/collection/[name]/delete?id=1
```

### Update Documents

```
PUT /api/collection/[name]/update
Body: { id: 1, action: "addScoreArray" | "insertIntoScore" | "multiplyScore" }
```

### Create Relationship

```
PUT /api/relationship/create
Body: { parentCollection: "collectionA", parentId: 10, childIds: [7,8,9] }
```

### Aggregation

```
GET /api/aggregate/[parentId]?parentCollection=collectionA&childCollection=collectionB
```

## 💡 Usage Guide

### Step 1: Insert Documents

1. Select collection (A or B)
2. Enter document ID (e.g., `1`)
3. Add fields as JSON: `{"name": "John", "age": 25}`
4. Click "Insert Document"
5. Repeat to add at least 3 documents to each collection

### Step 2: Delete Documents

1. Select collection
2. Enter document ID to delete
3. Click "Delete Document"

### Step 3: Add Score Array

1. Select collection and document ID
2. Choose "Add Score Array (Task 3)"
3. Click "Update Document"

### Step 4: Insert into Score

1. Select collection and document ID
2. Choose "Insert into Score (Task 4)"
3. Click "Update Document"
   - If ID = 1, inserts 5 at position 3
   - Otherwise, inserts 6 at position 4

### Step 5: Multiply Score

1. Select collection and document ID
2. Choose "Multiply Score by 20 (Task 5)"
3. Click "Update Document"

### Step 6: Create Relationship

1. Select parent collection
2. Enter parent document ID
3. Enter child IDs (comma-separated: `7, 8, 9`)
4. Click "Create Relationship"

### Step 7: Run Aggregation

1. Select parent and child collections
2. Enter parent document ID
3. Click "Run Aggregation"
4. View merged document with related children

## 🛠️ Technologies

- **Next.js 14** (App Router)
- **React 18**
- **Tailwind CSS**
- **MongoDB Native Driver**
- **React Hot Toast**

## 📝 MongoDB Commands Used

- `insertOne()` / `insertMany()`
- `deleteOne()`
- `updateOne()` with `$set`, `$push`, `$each`, `$position`
- Aggregation pipeline updates with `$map` and `$multiply`
- `aggregate()` with `$match` and `$lookup`

## 🎨 UI Features

- Single-page interface with all 7 tasks
- Responsive design with Tailwind CSS
- Real-time toast notifications
- JSON response viewer
- Live document preview
- Loading states
- Clean card-based layout

## 📄 License

MIT
