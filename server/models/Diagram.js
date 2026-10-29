const mongoose = require('mongoose');

const FieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, default: 'VARCHAR' },
  isPk: { type: Boolean, default: false },
  isFk: { type: Boolean, default: false }
}, { _id: false });

const TableSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  color: { type: String, default: '#6366f1' },
  position: {
    x: { type: Number, default: 100 },
    y: { type: Number, default: 100 }
  },
  fields: [FieldSchema]
}, { _id: false });

const RelationSchema = new mongoose.Schema({
  id: { type: String, required: true },
  fromTableId: { type: String, required: true },
  toTableId: { type: String, required: true },
  cardinality: { type: String, default: '1:N' },
  label: { type: String, default: '' }
}, { _id: false });

const DiagramSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'New Diagram' },
  tables: [TableSchema],
  relations: [RelationSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Diagram', DiagramSchema);
