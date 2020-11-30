import React from "react";
import Target from "./Target"

import "./Workspace.css";

const Workspace = () => {
  return (
    <div className="Workspace">
      <div
        className="targetObject"
        id="box1"
      ></div>

      <div
        className="targetObject"
        id="box2"
      ></div>

      <div
        className="targetObject"
        id="box3"
      ></div>
    </div>

  );
};

export default Workspace;
