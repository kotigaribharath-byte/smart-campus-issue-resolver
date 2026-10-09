import mongoose from 'mongoose';

const issueUpdateSchema = new mongoose.Schema(
  {
    issueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Issue',
      required: true,
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousStatus: {
      type: String,
      default: '',
    },
    newStatus: {
      type: String,
      default: '',
    },
    comment: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    actionType: {
      type: String,
      enum: [
        'created',
        'assigned',
        'status_change',
        'comment',
        'reopened',
        'resolved',
        'feedback',
      ],
      default: 'comment',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

issueUpdateSchema.index({ issueId: 1, createdAt: 1 });

const IssueUpdate = mongoose.model('IssueUpdate', issueUpdateSchema);
export default IssueUpdate;
