const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;
const mongoUrl = 'mongodb://mongo:27017'; // Tên service MongoDB trong docker-compose
const dbName = 'mydb';

app.use(express.json());

// Kết nối MongoDB và tạo API đơn giản
async function startServer() {
    try {
        const client = await MongoClient.connect(mongoUrl, { useUnifiedTopology: true });
        const db = client.db(dbName);
        const collection = db.collection('items');

        // API: Lấy tất cả items
        app.get('/items', async (req, res) => {
            const items = await collection.find().toArray();
            res.json(items);
        });

        // API: Thêm item mới
        app.post('/items', async (req, res) => {
            const item = req.body;
            await collection.insertOne(item);
            res.status(201).json(item);
        });

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        process.exit(1);
    }
}

startServer();