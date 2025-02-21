import { useState } from "react";
import { Button } from "@rewind-ui/core";
import logo from "./assets/images/logo-universal.png";
import "./App.css";
import { Greet } from "../wailsjs/go/main/App";

import LanguageSelector from "@/components/LanguageSelector";

function App() {
  return (
    <div id="App">
      <LanguageSelector />
    </div>
  );
}

export default App;
