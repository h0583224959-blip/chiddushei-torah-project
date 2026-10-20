import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String, required: true },
    originalFileName: { type: String },
    fileMimeType: { type: String },
    fileFormat: { type: String },
    coverImage: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const Item = mongoose.model('Item', itemSchema);

export default Item;