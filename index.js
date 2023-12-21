const express = require('express')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('I am walking')
})


// db
const uri = process.env.URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");

    const database = client.db("TaskarPro")
    const tasksCollection = database.collection("tasks")

    // Endpoint to create a new task
    app.post('/api/tasks', async (req, res) => {
      try {
        const result = await tasksCollection.insertOne(req.body);
        res.json(result.ops[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Endpoint to get all tasks
    app.get('/api/tasks', async (req, res) => {
      try {
        const tasks = await tasksCollection.find().toArray();
        res.json(tasks);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Endpoint to get a specific task by ID
    app.get('/api/tasks/:taskId', async (req, res) => {
      try {
        const task = await tasksCollection.findOne({ _id: new ObjectId(req.params.taskId) });
        if (!task) {
          return res.status(404).json({ message: 'Task not found' });
        }
        res.json(task);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Endpoint to update a task by ID
    app.put('/api/tasks/:taskId', async (req, res) => {
      try {
        const newData = { $set: req.body };
        const updatedTask = await tasksCollection.findOneAndUpdate(
          { _id: new ObjectId(req.params.taskId) },
          newData,
          { returnOriginal: false }
        );
        if (!updatedTask.value) {
          return res.status(404).json({ message: 'Task not found' });
        }
        res.json(updatedTask.value);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    // Endpoint to delete a task by ID
    app.delete('/api/tasks/:taskId', async (req, res) => {
      try {
        const result = await tasksCollection.findOneAndDelete({ _id: new ObjectId(req.params.taskId) });
        if (!result.value) {
          return res.status(404).json({ message: 'Task not found' });
        }
        res.json({ message: 'Task deleted successfully' });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.listen(port, () => {
  console.log(`Task app listening on port ${port}`)
})