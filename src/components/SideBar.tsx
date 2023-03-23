import { createSignal } from "solid-js";

import { Text, Box, FormControl, FormHelperText, FormLabel, Input, VStack, Center, Divider } from "@hope-ui/solid";

import { InferenceParameters } from "../models/protocol";

export default function SideBar(props: {
  currentParams: InferenceParameters,
  onParamsApplied: (params: InferenceParameters) => void,
}) {
  // Store a state variable for the params, so we can edit them before applying them.
  const [params, setParams] = createSignal(props.currentParams);

  return (
    <Box bg="$neutral3" width="$72" overflowY="scroll" >
      <Center>
        <Text fontWeight="$bold" padding="$3">Parameters</Text>
      </Center>

      <Divider />

      <Box padding="$3">
        <VStack spacing="$3">
          {/* Temperature */}
          <FormControl>
            <FormLabel>Temperature</FormLabel>
            <Input
              type="number"
              value={params().temp}
              onInput={(e) => setParams({
                ...params(),
                temp: parseFloat(e.currentTarget.value),
              })}
            />
            <FormHelperText>Controls randomness of predictions. Lower temperature results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive. Higher temperature results in more random completions.</FormHelperText>
          </FormControl>

          {/* Top P */}
          <FormControl>
            <FormLabel>Top P</FormLabel>
            <Input
              type="number"
              value={params().top_p}
              onInput={(e) => setParams({
                ...params(),
                top_p: parseFloat(e.currentTarget.value),
              })}
            />
            <FormHelperText>Controls diversity via nucleus sampling. 0.5 means half of all likelihood-weighted options are considered.</FormHelperText>
          </FormControl>

          {/* Repeat Penalty */}
          <FormControl>
            <FormLabel>Repeat Penalty</FormLabel>
            <Input
              type="number"
              value={params().repeat_penalty}
              onInput={(e) => setParams({
                ...params(),
                repeat_penalty: parseFloat(e.currentTarget.value),
              })}
            />
            <FormHelperText>How much to penalize new tokens based on their existing frequency in the text so far. Decreases the model's likelihood to repeat the same line verbatim.</FormHelperText>
          </FormControl>

          <FormControl>
            <FormLabel>Repeat Last N</FormLabel>
            <Input
              type="number"
              value={params().repeat_last_n}
              onInput={(e) => setParams({
                ...params(),
                repeat_last_n: parseInt(e.currentTarget.value),
              })}
            />
          </FormControl>

          {/* Max Token Count (if 0 => disabled) */}
          <FormControl>
            <FormLabel>Max Token Count</FormLabel>
            <Input
              type="number"
              value={params().max_token_count || 0}
              onInput={(e) => {
                const value = parseInt(e.currentTarget.value);
                setParams({
                  ...params(),
                  max_token_count: value === 0 ? null : value,
                });
              }}
            />
            <FormHelperText>Set to 0 to disable limit on token count.</FormHelperText>
          </FormControl>

          {/* Batch Size */}
          <FormControl>
            <FormLabel>Batch Size</FormLabel>
            <Input
              type="number"
              value={params().batch_size}
              onInput={(e) => setParams({
                ...params(),
                batch_size: parseInt(e.currentTarget.value),
              })}
            />
          </FormControl>

          {/* Top K */}
          <FormControl>
            <FormLabel>Top K</FormLabel>
            <Input
              type="number"
              value={params().top_k}
              onInput={(e) => setParams({
                ...params(),
                top_k: parseInt(e.currentTarget.value),
              })}
            />
          </FormControl>
        </VStack>
      </Box>
    </Box>
  );
}
