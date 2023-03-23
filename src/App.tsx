import { createSignal, onMount } from "solid-js";

import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";

import { Box, Flex, Spacer } from "@hope-ui/solid";

import { HistoryEntry, MessageSender } from "./models/message";
import { defaultInferenceParameters, OnInferenceTokenPayload, OnModelLoadProgressPayload } from "./models/protocol";

import ChatView from "./components/ChatView";
import BottomChatControls from "./components/BottomChatControls";
import TopBar from "./components/TopBar";
import ModelPickerDialog from "./components/ModelPickerDialog";
import ModelLoadingDialog from "./components/ModelLoadingDialog";
import SideBar from "./components/SideBar";

function App() {
  // The current prompt entered by the user, i.e. the message that the user wants to send to the AI.
  // Gets cleared when the user submits the prompt.
  const [prompt, setPrompt] = createSignal("");
  
  // List of all messages exchanged between the user and the AI during the current session.
  const [history, setHistory] = createSignal<HistoryEntry[]>([], { equals: false });

  // Whether the AI is currently generating a response.
  // If true, the user cannot submit new prompts.
  const [isInferenceRunning, setIsInferenceRunning] = createSignal(false);

  // Settings for the current inference configuration.
  const [inferenceParams, setInferenceParams] = createSignal(defaultInferenceParameters);
  


  const [modelLoadProgress, setModelLoadProgress] = createSignal(0);
  const [isLoadingModel, setIsLoadingModel] = createSignal(false);


  const [isModelPickerOpen, setIsModelPickerOpen] = createSignal(false);

  // Reference to the chat view container. Used to scroll to the bottom of the chat view.
  let chatViewContainer: HTMLDivElement | undefined;

  /**
   * Performs a scroll to the bottom of the chat view.
   * This is useful to keep the chat view scrolled to the bottom when new messages are added.
   * @param smooth Whether to perform a smooth scroll or not.
   */
  function scrollChatViewToBottom(smooth = true) {
    chatViewContainer?.scrollTo({
      top: chatViewContainer.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  }

  /**
   * Signals the backend that the user wants to cancel the current inference.
   * This is a best-effort operation, and the backend may not be able to cancel
   * the inference.
   * 
   * Cancelling is done internally by returning an error in the inference callback.
   */
  function requestCancel() {
    invoke("request_cancel");
  }

  // Requests the backend to load the ML model from the specified path.
  async function loadModel(path: string) {
    if (isInferenceRunning()) {
      return;
    }

    setModelLoadProgress(0);
    setIsLoadingModel(true);

    await invoke(
      "load_model",
      {
        path: path
      }
    ).catch((e) => {
      // todo show error
      console.error(e);
    });

    setIsLoadingModel(false);
  }

  /**
   * Requests the backend to run inference on the current prompt, waits
   * for the response and updates the chat view.
   */
  async function submitPrompt() {
    // Lock the UI so that the user cannot submit another prompt.
    setIsInferenceRunning(true);

    // Push user-generated message to the history.
    setHistory([
      ...history(),
      {
        sender: MessageSender.User,
        content: prompt(),
        timestamp: new Date(),
        pending: false,
      }
    ]);

    // Store the current prompt and set it to an empty string, so that the text
    // area gets cleared.
    const currentPrompt = prompt();
    setPrompt("");

    // Push a placeholder message to the history, so that the user can see that
    // the AI is generating a response.
    setHistory([
      ...history(),
      {
        sender: MessageSender.System,
        content: "",
        timestamp: new Date(),
        pending: true,
      }
    ]);

    // Scroll to the bottom of the chat view.
    // todo: remove once we do this better
    scrollChatViewToBottom();

    // Send the prompt to the AI and wait for the response.
    // The response will be streamed to the UI via the on_inference_token event, and
    // this invocation (if awaited) will only return once the response is complete. 
    await invoke(
      "run_inference",
      { 
        prompt: currentPrompt,
        params: inferenceParams(),
      }
    ).catch((e) => {
      // todo show error
      console.error(e);
    });

    // Set pending to false and update the timestamp of the last pending message in
    // the history.
    const pending = history().pop();
    if (pending !== undefined) {
      setHistory([
        ...history(),
        {
          ...pending,
          pending: false,
          timestamp: new Date(),
        },
      ]);
    }

    // All good, unlock the UI and allow the user to submit other prompts.
    setIsInferenceRunning(false);
  }
  
  onMount(() => {
    // Little trick to avoid a white flashing screen while the
    // application is loading.
    invoke("show_window");

    // Start listening for events that indicate the progress of the model loading.
    listen<OnModelLoadProgressPayload>("on_model_load_progress", (event) => {
      const payload = event.payload;
      setModelLoadProgress(payload.progress);
    });

    // Start listening for inference tokens from the backend.
    listen<OnInferenceTokenPayload>("on_inference_token", (event) => {
      const payload = event.payload;

      // Edit the last message in the history, which is the placeholder message
      // that we added in submitPrompt().
      const pending = history().pop();
      if (pending !== undefined) {
        console.log("appending received token to pending message");
        setHistory([
          ...history(),
          {
            // TODO: check for alternatives: this is a bit hacky, but I couldn't
            // find a better way to update the content of a field in a signal of
            // an array, in a way that would result in a re-render of the chat view.
            // (at least using <Index> or <For>, it was working fine with .map but
            // whatever)
            ...pending,
            content: pending.content + payload.token,
          }
        ]);
      }
  
      scrollChatViewToBottom(false);
  
      // If the current scroll position is close to the bottom of the chat view,
      // scroll to the bottom of the chat view after the new token is added.
      // This is useful to keep the chat view scrolled to the bottom when new messages
      // are added, but not when the user is scrolling up.
      if (chatViewContainer?.scrollTop || 0 > (chatViewContainer?.scrollHeight || 0) - (chatViewContainer?.clientHeight || 0) - 20) {
        //scrollChatViewToBottom();
      }
    });
  });

  return (
    <Box height="$screenH">
      <Flex direction="row" height="$full">
        <SideBar currentParams={inferenceParams()} onParamsApplied={setInferenceParams} />
        
        <Box flex={1}>
          <Flex direction="column" height="$full">
            <TopBar
              onClearSession={() => undefined} // TODO: implement new session creation and chat history clearing
              onSelectModel={() => setIsModelPickerOpen(true)}
            />

            {/* Scrollable container for the chat history. */}
            <Box ref={chatViewContainer} padding="$4" overflowY="scroll" height="$full">
              <ChatView history={history()} />
            </Box>

            <Spacer />
            <Box flex={1} bg="$neutral2" padding="$4" >
              <BottomChatControls
                prompt={prompt()}
                isInferenceRunning={isInferenceRunning()}
                onInput={setPrompt}
                onSubmit={submitPrompt}
                onCancel={requestCancel}
              />
            </Box>
          </Flex>
        </Box>
      </Flex>

      <ModelPickerDialog
        opened={isModelPickerOpen()}
        initialModel={"TEST ONLY"}
        onClose={() => setIsModelPickerOpen(false)}
        onModelSelected={loadModel}
      />

      <ModelLoadingDialog
        opened={isLoadingModel()}
        progress={modelLoadProgress()}
        message="Loading model..."
      />
    </Box>
  );
}

export default App;
