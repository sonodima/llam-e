import { For } from "solid-js";

import { writeText } from "@tauri-apps/api/clipboard";
import { Flex, Spacer, VStack } from "@hope-ui/solid";

import { HistoryEntry, MessageSender } from "../models/message";
import MessageBubble from "./MessageBubble";

/**
 * Component that renders a list of message bubbles.
 * This does not handle scrolling, which should be handled by the parent.
 */
export default function ChatView(props: { history: HistoryEntry[] }) {
  async function copyToClipboard(text: string) {
    await writeText(text);
  }

  return (
    <VStack spacing="$2">                
      <For each={props.history}>{(message) => (
        <Flex 
          direction={message.sender === MessageSender.User ? "row" : "row-reverse"}
          width="$full"
        >
          <Spacer />
          <MessageBubble
            message={message}
            onCopy={() => copyToClipboard(message.content)}
          />
        </Flex>
      )}</For>
    </VStack>
  );
}
