import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  type: 'application' | 'job' | 'message' | 'system' | 'alert';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['application', 'job', 'message', 'system', 'alert'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: Schema.Types.Mixed,
    read: {
      type: Boolean,
      default: false,
    },
    actionUrl: String,
  },
  {
    timestamps: true,
  }
);

// Index for user notifications
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);