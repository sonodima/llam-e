import { createSignal, JSX, Show } from "solid-js";

import { Container, HStack, Icon, IconButton, Spacer, Text, Tooltip } from "@hope-ui/solid";
import { AiOutlineCopy } from "solid-icons/ai";
import { FiCpu } from "solid-icons/fi";

import { HistoryEntry, MessageSender } from "../models/message";

function MessageBubbleButton(props: { icon: JSX.Element, onClick: () => void }) {
  return (
    <IconButton
      size="sm"
      color="white"
      variant="ghost"
      compact={true}
      aria-label="Modify"
      colorScheme="neutral"
      icon={props.icon}
      onClick={props.onClick}
    />
  );
}

export default function MessageBubble(
  props: {
    message: HistoryEntry,
    onCopy: () => void,
  }
) {
  const [hovered, setHovered] = createSignal(false);

  const fg = () => props.message.sender === MessageSender.User ? "$text" : "white";
  const bg = () => props.message.sender === MessageSender.User ?
    "linear-gradient(0deg, $neutral4 0%, $neutral7 100%);" :
    "linear-gradient(0deg, $primary7 0%, $primary9 100%)";

  return (
    <Container
      bg={bg()}
      css={{ backgroundAttachment: "fixed" }}
      borderRadius="$2xl"
      padding="$3"
      width="fit-content"
      minWidth="$48"
      maxWidth="$96"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Content of the message bubble. Bind it in the property so that new lines are automagically replaced with <br/>s */}
      <Text color={fg()} innerText={props.message.content} />

      <Spacer height="$2" />
      <HStack>
        {/* Buttons to perform actions on the message */}
        <HStack
          spacing="$1"
          opacity={hovered() ? 1.0 : 0.0}
          transition="opacity 0.2s"
        >
          <MessageBubbleButton
            icon={<AiOutlineCopy />}
            onClick={props.onCopy}
          />
        </HStack>

        <Spacer />
        <Show
          when={!props.message.pending}
          fallback={(
            // Animation to indicate that the response is being processed.
            <Tooltip label="Waiting for response">
              <Icon animation="pulse 1s infinite">
                <FiCpu size="22" />
              </Icon>
            </Tooltip>
          )}
        >
          {/* Timestamp of the message. */}
          <Text color={fg()} fontSize="x-small" marginRight="$2">
            {props.message.timestamp.toLocaleTimeString()}
          </Text>
        </Show>
      </HStack>
    </Container>
  );
}
