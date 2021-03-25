import React, { useState } from "react";

export function ResizeBar() {
  const [pos, setPos] = useState(0);

  return (
    <div
      onTouchMove={(e) => {
        setPos(Math.max(0, e.touches[0].clientY));
      }}
      style={{ marginTop: pos, width: 200, height: 50, background: "red" }}
    ></div>
  );
}
