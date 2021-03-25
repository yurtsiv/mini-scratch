import React from "react";
import "./App.css";
import { RecoilRoot } from "recoil";

import { ResizeBar } from "components/ResizeBar";

function App() {
  return (
    <RecoilRoot>
      <ResizeBar />
    </RecoilRoot>
  );
}

export default App;
