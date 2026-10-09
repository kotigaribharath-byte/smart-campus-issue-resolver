import mongoose from 'mongoose';

const buildingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Building name is required'],
      unique: true,
      trim: true,
    },
    block: {
      type: String,
      default: '',
      trim: true,
    },
    floors: {
      type: [String],
      default: ['Ground Floor', '1st Floor', '2nd Floor', '3rd Floor'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Building = mongoose.model('Building', buildingSchema);
export default Building;
