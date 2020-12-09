import React, { useContext } from "react";

import { FaTrash } from "react-icons/fa";

import CursorImg from "../../assets/img/cursor.png";
import TransitionImg from "../../assets/img/transition.png";
import NodeImg from "../../assets/img/state.png";
import supportedEventTypes from "../../shared/supportedEventTypes";
import supportedObjectTypes from "../../shared/supportedObjectTypes";
import supportedBehaviors from "../../shared/supportedBehaviors";
import ControlContext from "../../contexts/control-context";

import "./ControlPanel.css";
const Modes = ({
  currMode,
  changeCurrMode,
}) => {
  return (
    <div className="Control">
      <h3>Mode:</h3>
      <div className="Modes">
        <div
          className={["Mode", currMode === "select" ? "Active" : null].join(
            " "
          )}
          onClick={() => changeCurrMode("select")}
        >
          <img src={CursorImg} alt="cursor" />
        </div>
        <div
          className={["Mode", currMode === "node" ? "Active" : null].join(" ")}
          onClick={() => changeCurrMode("node")}
        >
          <img src={NodeImg} alt="node" />

        </div>
        <div
          className={["Mode", currMode === "transition" ? "Active" : null].join(" ")}
          onClick={() => changeCurrMode("transition")}
        >
          <img src={TransitionImg} alt="transition" />
        </div>
      </div>
    </div>
  );
};

const OptionPicker = ({ title, currSelected, setOption, allOptions }) => {
  return (
    <div className="Control">
      <h3>{title}</h3>
      <div className="Modes">
        {allOptions.map((option, idx) => (
          <div
            key={idx}
            className={["Mode", currSelected === option ? "Active" : null].join(
              " "
            )}
            onClick={() => {
                setOption(option);
            }}
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};

const NodeName = ({
  currNodeName,
  changeCurrNodeName,
}) => {
  return (
    <form className="form">
      <label for="nodeName">Name: </label>
      <input
        type="text"
        name="nodeName"
        placeholder="Enter State Name"
        value={currNodeName}
        onChange={(e) => {
          changeCurrNodeName(e.target.value);
        }}
      />
  </form>
  );
};

const EventType = ({ currEventType, changeCurrEventType }) => {
  return (
    <OptionPicker
      title={"Transition Type:"}
      currSelected={currEventType}
      setOption={changeCurrEventType}
      allOptions={supportedEventTypes}
    />
  );
};

const ObjectType = ({ currObjectType, changeCurrObjectType }) => {
  return (
    <OptionPicker
      title={"on Object:"}
      currSelected={currObjectType}
      setOption={changeCurrObjectType}
      allOptions={supportedObjectTypes}
    />
  );
};

const Behavior = ({ currBehavior, changeCurrBehavior }) => {
  return (
    <OptionPicker
      title={"Behavior:"}
      currSelected={currBehavior}
      setOption={changeCurrBehavior}
      allOptions={supportedBehaviors}
    />
  );
};


const Delete = ({ selectedStateObjectId, deleteSelectedStateObject, resetStateDiagram }) => {
  return (
    <div className="Control">
      <h3>Delete:</h3>
      <div className="DeleteButtonsContainer">
        <button
          onClick={() => deleteSelectedStateObject()}
          disabled={!selectedStateObjectId || selectedStateObjectId==="start"}
          style={{
            cursor: !selectedStateObjectId ? "not-allowed" : null,
          }}
        >
          <FaTrash className="ButtonIcon" /> Delete
        </button>{" "}
        <button
          onClick={() => resetStateDiagram()}
        >
          <FaTrash className="ButtonIcon" /> Reset
        </button>{" "}
      </div>
    </div>
  );
};

const ControlPanel = () => {
  // use useContext to access the functions & values from the provider
  const {
    currMode,
    changeCurrMode,
    currNodeName,
    changeCurrNodeName,
    currEventType,
    changeCurrEventType,
    currObjectType,
    changeCurrObjectType,
    currBehavior,
    changeCurrBehavior,
    resetStateDiagram,
    selectedStateObjectId,
    deleteSelectedStateObject,
  } = useContext(ControlContext);

  var currOptions = undefined;

  if(currMode === "cursor"){
    currOptions = undefined;
  }
  else if(currMode === "transition"){
    currOptions = (<>
                  <EventType
                    currEventType={currEventType}
                    changeCurrEventType={changeCurrEventType}
                  />
                  <ObjectType
                    currObjectType={currObjectType}
                    changeCurrObjectType={changeCurrObjectType}
                  />

                  <Behavior
                    currBehavior={currBehavior}
                    changeCurrBehavior={changeCurrBehavior}
                  />

                  </>
    );
  }
  else if(currMode === "node"){
    currOptions = <NodeName
                    currNodeName={currNodeName}
                    changeCurrNodeName={changeCurrNodeName}
                  />
  }

  return (
    <div className="ControlPanel">
      <h2 className="component-title">Control Panel</h2>
      <Modes
        currMode={currMode}
        changeCurrMode={changeCurrMode}
        currNodeName={currNodeName}
        currEventType={currEventType}
      />

      {currOptions}

      <Delete
        selectedStateObjectId={selectedStateObjectId}
        deleteSelectedStateObject={deleteSelectedStateObject}
        resetStateDiagram={resetStateDiagram}
      />

    </div>
  );
};

export default ControlPanel;
