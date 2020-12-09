import React from "react";

import SVGLayer from "./SVGLayer/SVGLayer";

import "./StateDiagram.css";

const StateDiagram = () => {
  return (
    <div className="StateDiagram">
      <h2 className="component-title">State Diagram Builder</h2>

      <SVGLayer />
    </div>
  );
};

export default StateDiagram;
