import mongoose, { Schema, model, models } from 'mongoose';

export interface IMessage {
  sender: string;
  receiver?: string;
  groupName?: string;
  text: string;
  imageUrl?: string;
  timestamp: Date;
  read?: boolean;
  isGroup?: boolean;
}

const MessageSchema = new Schema<IMessage>({
  sender: { type: String, required: true, index: true },
  receiver: { type: String, index: true },
  groupName: { type: String, index: true },
  text: { type: String, required: false },
  imageUrl: { type: String },
  timestamp: { type: Date, default: Date.now, index: true },
  read: { type: Boolean, default: false },
  isGroup: { type: Boolean, default: false },
});

MessageSchema.index({ sender: 1, receiver: 1, timestamp: -1 });
MessageSchema.index({ groupName: 1, timestamp: -1 });

const Message = models.Message || model<IMessage>('Message', MessageSchema);

export default Message;
