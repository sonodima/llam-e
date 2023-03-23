/**
 * The entity that sent a message.
 * @see HistoryEntry
 */
export enum MessageSender {
  User,
  System
}

/**
 * A message that can be displayed in the chat history.
 */
export interface HistoryEntry {
  sender: MessageSender;
  content: string;
  timestamp: Date;
  pending: boolean;
}
