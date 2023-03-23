import { open } from "@tauri-apps/api/dialog";

import { Text, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@hope-ui/solid";

export default function ModelPickerDialog(
  props: {
    opened: boolean,
    initialModel: string | undefined,
    onClose: () => void,
    onModelSelected: (path: string) => void,
  }
) {
  async function selectModel() {
    // Open a system dialog to select the file for the model.
    const selected = await open({
      multiple: false,
      filters: [{
        name: "GGML Model",
        extensions: ["bin"]
      }],
    });
    
    // If the user didn't select a file, return, but don't close the dialog.
    if (selected === null || selected.length === 0) {
      return;
    }

    props.onClose();
    props.onModelSelected(selected.toString());
  }

  return (
    <Modal opened={props.opened} onClose={() => undefined}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Select Model</ModalHeader>
        <ModalBody>
          <Text>Select a model to use for the inference.</Text>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            marginRight="$3"
            onClick={props.onClose}
          >
            Cancel
          </Button>

          <Button onClick={selectModel}>
            Load
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
