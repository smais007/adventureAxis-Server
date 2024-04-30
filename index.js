const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middleware
const corsConfig = {
  origin: ["http://localhost:5173"],
  credentials: true,
};
app.use(cors(corsConfig));
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dmdmzzd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const placeCollection = client.db("AdventureAxisDB").collection("place");
    const countryCollection = client
      .db("AdventureAxisDB")
      .collection("country");

    app.get("/country", async (req, res) => {
      try {
        const cursor = countryCollection.find();
        const result = await cursor.toArray();
        res.json(result);
      } catch (error) {
        console.error("Error fetching:", error);
        res.status(500).json({ error: "Server Error" });
      }
    });

    // Middleware to handle routes with query parameter
    const queryMiddleware = async (req, res, next) => {
      const country = req.query.country;
      if (country) {
        const cursor = placeCollection.find({ country });
        const result = await cursor.toArray();
        res.send(result);
      } else {
        next(); // Pass control to the next middleware/route
      }
    };

    // Route for /places with query parameter
    app.get("/places", queryMiddleware, async (req, res) => {
      const cursor = placeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/places/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await placeCollection.findOne();
      res.send(result);
    });

    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      //const query = { _id: new ObjectId(id) };
      //const result = await placeCollection.findOne();
      const result = await placeCollection.findOne({ _id: new ObjectId(id) });
      console.log(result);
      res.send(result);
    });

    app.post("/places", async (req, res) => {
      const addPlace = req.body;
      console.log(addPlace);
      const result = await placeCollection.insertOne(addPlace);
      res.send(result);
    });

    app.put("/updatePlace/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedPlace = req.body;
      console.log(updatedPlace);
      const place = {
        $set: {
          image: updatedPlace.image,
          tourists_spot_name: updatedPlace.tourists_spot_name,
          country: updatedPlace.country,
          region: updatedPlace.region,
          location: updatedPlace.location,
          short_description: updatedPlace.short_description,
          seasonality: updatedPlace.seasonality,
          average_cost: updatedPlace.average_cost,
          travel_time: updatedPlace.travel_time,
          totaVisitorsPerYear: updatedPlace.totaVisitorsPerYear,
        },
      };
      try {
        const result = await placeCollection.updateOne(filter, place, options);
        res.send(result);
      } catch (error) {
        console.error("Error updating place:", error);
        res.status(500).send("Error updating place.");
      }
    });

    app.delete("/places/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await placeCollection.deleteOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to Adventure Axis Server");
});

app.listen(port, () => {
  console.log("Serever is running");
});
