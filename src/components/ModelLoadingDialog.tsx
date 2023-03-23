import { Text, Modal, ModalBody, ModalContent, ModalOverlay, VStack, CircularProgressIndicator, CircularProgress, CircularProgressLabel } from "@hope-ui/solid";

export default function ModelLoadingDialog(
  props: {
    opened: boolean,
    progress: number,
    message: string,
  }
) {
  return (
    <Modal opened={props.opened} onClose={() => undefined}>
      <ModalOverlay />
      <ModalContent>
        <ModalBody>
          <VStack spacing="$4" padding="$6">
            <Text>{props.message}</Text>
            <CircularProgress value={props.progress}>
              <CircularProgressIndicator withRoundCaps />
              <CircularProgressLabel />
            </CircularProgress>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
