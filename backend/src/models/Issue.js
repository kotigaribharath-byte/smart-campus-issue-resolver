import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide an issue description'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please select an issue category'],
      enum: [
        'Electrical',
        'Plumbing',
        'Wi-Fi/Network',
        'Furniture',
        'Air Conditioning',
        'Cleanliness',
        'Laboratory Equipment',
        'Classroom Equipment',
        'Security',
        'Other',
      ],
      index: true,
    },
    priority: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        'Submitted',
        'Assigned',
        'In Progress',
        'On Hold',
        'Resolved',
        'Closed',
        'Reopened',
      ],
      default: 'Submitted',
      index: true,
    },
    building: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Building',
      required: [true, 'Please select a building'],
      index: true,
    },
    floor: {
      type: String,
      required: [true, 'Please specify floor level'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Please specify room/exact location'],
      trim: true,
    },
    imageUrls: {
      type: [String],
      default: [],
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    reopenCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient filtering and sorting
issueSchema.index({ status: 1, priority: 1, createdAt: -1 });
issueSchema.index({ reportedBy: 1, status: 1 });
issueSchema.index({ assignedTo: 1, status: 1 });

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
