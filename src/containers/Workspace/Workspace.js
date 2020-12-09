import React, { useContext } from "react";
import Target from "./Target"
import ControlContext from "../../contexts/control-context";

import "./Workspace.css";

const Workspace = () => {
  const {
    handleEventInput
  } = useContext(ControlContext);

  return (
    <div className="Workspace" id="Workspace" onMouseDown={handleEventInput} onMouseUp={handleEventInput} onClick={handleEventInput} onDoubleClick={handleEventInput} onMouseMove={handleEventInput}>
      <div
        className="targetObject"
        id="box1"
        style={{left: "20px", top: "20px", width: "100px", height: "100px"}}
      ></div>

      <div
        className="targetObject"
        id="box2"
        style={{left: "220px", top: "20px", width: "100px", height: "100px"}}
      ></div>

      <div
        className="targetObject"
        id="box3"
        style={{left: "420px", top: "20px", width: "100px", height: "100px"}}
      ></div>
    </div>

  );
};

export default Workspace;
