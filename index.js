const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const res = require('express/lib/response');
const { query } = require('express');

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// CONNECTED TO MONGODB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tzrl78f.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
console.log('Connected to MongoDB');

async function run() {
  try {
    await client.connect();
    const productCollection = client
      .db('booksInventory')
      .collection('products');

    // GET API LOAD DATA FOR HOME PAGE
    app.get('/products', async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const product = await cursor.toArray();
      res.send(product);
    });

    // GET ITEM BY PRODUCT ID
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    // DELIVERED ITEM
    app.put('/delivered/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const currentQuantity = req.body;
      console.log(currentQuantity);
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: currentQuantity.quantity - 1,
        },
      };
      const newQuantity = await productCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      res.send(newQuantity);
    });

    // ADD TO STOCK
    app.put('/addtostock/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const currentQuantity = req.body;
      console.log(currentQuantity);
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = {
        $set: {
          quantity: currentQuantity.newQuantity,
        },
      };
      const newQuantity = await productCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      res.send(newQuantity);
    });
    // DELETE ITEM
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Books Warehouse Database');
});
app.listen(port, () => {
  console.log('Books are flying at port', port);
});
