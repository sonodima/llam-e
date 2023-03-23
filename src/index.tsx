/* @refresh reload */
import { render } from "solid-js/web";

import { HopeProvider, HopeThemeConfig } from "@hope-ui/solid";

import App from "./App";

import "./styles.css";

render(
  () => {
    const config: HopeThemeConfig = {
      initialColorMode: "dark",
    };
  
    return <HopeProvider config={config}>
      <App />
    </HopeProvider>; 
  },
  document.getElementById("root") as HTMLElement
);
