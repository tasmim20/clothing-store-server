require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("clothingStore");
    const productCollection = db.collection("products");

    //get products api
    app.get("/api/kids-wear", async (req, res) => {
      try {
        const result = await productCollection.find({}).toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching products:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal server error" });
      }
    });

    //get product according to category
    // app.get("/api/kids-wear/?category=category", async (req, res) => {
    //   const category = req.query.category;
    //   let query = {};
    //   if (category) {
    //     query.category = category;
    //   }
    //   const products = await productCollection.find(query).toArray();
    //   res.send(products);
    // });

    //get product according to id
    app.get("/api/kids-wear/:productId", async (req, res) => {
      const id = req.params.productId;
      const query = { _id: new ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    //flash sale product api
    app.get("/api/flash-sale", async (req, res) => {
      try {
        const products = await productCollection
          .find({ flashSale: true })
          .sort({ creationTime: -1 }) // Sort by createdAt field in descending order
          .toArray();

        res.send(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal server error" });
      }
    });

    //trending products
    app.get("/api/trending-product", async (req, res) => {
      try {
        const products = await productCollection
          .find({ flashSale: true })
          .sort({ rating: -1 }) // Sort by createdAt field in descending order
          .toArray();

        res.send(products);
      } catch (error) {
        console.error("Error fetching products:", error);
        res
          .status(500)
          .send({ success: false, message: "Internal server error" });
      }
    });
    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
