# LLaM-e

LLaM-e is a __HIGHLY EXPERIMENTAL__ but beautiful cross-platform chat client for LLaMA-like models, built in Rust 🦀 and TypeScript.

This program is based on the [llama-rs](https://github.com/setzer22/llama-rs) library, which is a Rust rewrite of [llama.cpp](https://github.com/ggerganov/llama.cpp).

The goal is to create a simple interface for interacting with LLaMA-like models, in a similar fashion to OpenAI's Playground.

## Supported _(Tested)_ Models

- [x] LLaMA 7B (Q4)
- [x] LLaMA 13B (Q4)
- [x] Alpaca 7B (Q4)
- [x] Alpaca 13B (Q4)

_If you have had success with other models, please add them to the list._

## Demo

![LLaM-e](media/images/demo.gif)

> In the demo, __Alpaca 7B (Q4)__ is running on a MacBook Pro with a 10 core M1 Pro CPU and 16GB of RAM.
>
> With this hardware, 13B models can be run withouth any problems, though a bit slower.

## Architecture

LLaM-e is built with the [TAURI](https://tauri.studio/) framework, which is a cross-platform framework for creating lightweight desktop applications with web technologies and Rust. _(aka. Electron, but better)_

The frontend uses [SolidJS](https://solidjs.com/) and the [HopeUI](https://hope-ui.com/) component library.

## Performance

You can expect the same performance as the original [llama-rs](https://github.com/setzer22/llama-rs) codebase.

Note that the performance of the model is highly dependent on the hardware you are running it on, and it degrades significantly when the program is ran in debug mode.

## Compiling

1. Setup your system for compiling a TAURI application. [See the docs](https://tauri.app/v1/guides/getting-started/prerequisites).
2. Install NodeJS and NPM.
3. Run `npm install` to install the dependencies.
4. Run `npm run tauri build` to create the package for your platform.

## Contributing

There is a lot of work to be done, both in this repository and in the [llama-rs](https://github.com/setzer22/llama-rs) library, so if you want to contribute, please feel free to do so. 🙏🏼

## Roadmap

- [ ] Improve model loading system:
  - Open load model dialog when the user attempts to submit a prompt without a model loaded. (now you have to click on the box icon on the top right)
  - Unify model selection dialog with loading progress dialog.
  - Properly implement progress calculation for model loading.
- [ ] Implement session management:
  - Allow session clearing.
  - Add session export/import capabilities.

## About the Model

LLaMA is a language model released by Meta. Due to licensing restrictions, the model is not included in this repository.

For more information, refer to the [llama.cpp](https://github.com/ggerganov/llama.cpp) repository, which includes the tools to quantize the models.

I have noticed that [Alpaca](https://github.com/tatsu-lab/stanford_alpaca), which is a model released by Stanford (which is based on LLaMA), produces better results than LLaMA itself.

This project shall not be used for any commercial purposes.
