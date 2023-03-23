import { Text, HStack, IconButton, Spacer, Flex, Center } from "@hope-ui/solid";
import { AiOutlineDelete } from "solid-icons/ai";
import { BsBox } from "solid-icons/bs";

export default function TopBar(
  props: {
    onClearSession: () => void;
    onSelectModel: () => void;
  }
) {
  return (
    <Flex bg="$neutral2" padding="$3">
      {/* Project name, positioned to the left. */}
      <Center>
        <Text fontWeight="$bold" marginLeft="$3">LLaM-e</Text>
      </Center>

      {/* Action buttons, positioned to the right. */}
      <Spacer />
      <HStack spacing="$2">        
        <IconButton
          variant="ghost"
          aria-label="Clear Session"
          onClick={props.onClearSession}
          icon={<AiOutlineDelete />}
        />

        <IconButton
          variant="dashed"
          aria-label="Select Model"
          onClick={props.onSelectModel}
          icon={<BsBox />}
        />
      </HStack>  
    </Flex>
  );
}
