import { Show } from "solid-js";

import { Button, HStack, Textarea } from "@hope-ui/solid";

export default function BottomChatControls(
  props: {
    prompt: string,
    isInferenceRunning: boolean,
    onInput: (prompt: string) => void,
    onSubmit: () => void,
    onCancel: () => void,
  }
) {
  // Function that checks if there is at least one non-newline and non-whitespace
  // character in the prompt.
  function promptIsNotEmpty() {
    return props.prompt.trim().length !== 0;
  }

  return (
    <HStack spacing={12}>
      {/* Allow user input even if disabled, but block submission. */}
      <Textarea
        placeholder="Type your prompt here"
        onInput={(e) => props.onInput(e.currentTarget.value)}
        value={props.prompt}
        size="xs"
        fontSize="small"
        resize="none"
        onKeyDown={(e) => {
          // If the prompt is not empty, the user pressed enter, and shift is not pressed, then 
          // submit it, otherwise insert a newline as normal.
          if (e.key === "Enter" && promptIsNotEmpty() && !props.isInferenceRunning && !e.shiftKey) {
            e.preventDefault();
            props.onSubmit();
          }
        }}
      />

      <Show
        when={!props.isInferenceRunning}
        fallback={
          <Button
            onClick={props.onCancel}
            size="lg"
            variant="subtle"
            colorScheme="danger"
          >
            Cancel
          </Button>
        }
      >
        {/* Inference is not running, show the 'submit' button. */}
        <Button
          disabled={!promptIsNotEmpty()}
          onClick={props.onSubmit}
          size="lg"
          variant="subtle"
        >
          Submit
        </Button>
      </Show>
    </HStack>
  );
}
