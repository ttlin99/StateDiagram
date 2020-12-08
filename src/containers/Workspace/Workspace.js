import React, { useContext } from "react";
import Target from "./Target"
import ControlContext from "../../contexts/control-context";

import "./Workspace.css";

const Workspace = () => {
  const {
    onMouseDown
  } = useContext(ControlContext);
  
  return (
    <div className="Workspace" onMouseDown={onMouseDown}>
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
