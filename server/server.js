const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Diagram = require('./models/Diagram');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/relational_diagram_db';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB successfully:', MONGODB_URI);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });

// Routes

// 1. Get all diagrams
app.get('/api/diagrams', async (req, res) => {
  try {
    const diagrams = await Diagram.find().sort({ updatedAt: -1 });
    res.json(diagrams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Get latest diagram (or create blank if none exists)
app.get('/api/diagrams/latest', async (req, res) => {
  try {
    let diagram = await Diagram.findOne().sort({ updatedAt: -1 });
    if (!diagram) {
      // Return null so frontend can start fresh or create first
      return res.json(null);
    }
    res.json(diagram);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Get single diagram by ID
app.get('/api/diagrams/:id', async (req, res) => {
  try {
    const diagram = await Diagram.findById(req.params.id);
    if (!diagram) {
      return res.status(404).json({ error: 'Diagram not found' });
    }
    res.json(diagram);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Create new diagram
app.post('/api/diagrams', async (req, res) => {
  try {
    const { name, tables, relations } = req.body;
    const newDiagram = new Diagram({
      name: name || 'New Diagram',
      tables: tables || [],
      relations: relations || []
    });
    const saved = await newDiagram.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 5. Update diagram (Upsert if id provided or save)
app.put('/api/diagrams/:id', async (req, res) => {
  try {
    const { name, tables, relations } = req.body;
    const updated = await Diagram.findByIdAndUpdate(
      req.params.id,
      {
        name,
        tables,
        relations
      },
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ error: 'Diagram not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 6. Delete diagram
app.delete('/api/diagrams/:id', async (req, res) => {
  try {
    const deleted = await Diagram.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Diagram not found' });
    }
    res.json({ message: 'Diagram deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Relational Diagram API Server running on port ${PORT}`);
});
