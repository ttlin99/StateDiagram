import React, { useContext } from "react";

import { FaTrash } from "react-icons/fa";

import CursorImg from "../../assets/img/cursor.png";
import TransitionImg from "../../assets/img/transition.png";
import StateObjectImg from "../../assets/img/state.png";
import supportedStateTypes from "../../shared/supportedStateTypes";
import supportedEventTypes from "../../shared/supportedEventTypes";
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
          className={["Mode", currMode === "stateObject" ? "Active" : null].join(" ")}
          onClick={() => changeCurrMode("stateObject")}
        >
          <img src={StateObjectImg} alt="stateObject" />

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

const StateTypePicker = ({ title, currStateType, setCurrStateType }) => {
  return (
    <div className="Control">
      <h3>{title}</h3>
      <div className="Modes">
        {supportedStateTypes.map((stateType, idx) => (
          <div
            key={idx}
            className={["Mode", currStateType === stateType ? "Active" : null].join(
              " "
            )}
            onClick={() => {
                setCurrStateType(stateType);
            }}
          >
            {stateType}
          </div>
        ))}
      </div>
    </div>
  );
};

const StateType = ({
  currStateType,
  changeCurrStateType,
}) => {
  return (
    <StateTypePicker
      title={"State Type:"}
      currStateType={currStateType}
      setCurrStateType={changeCurrStateType}
    />
  );
};

const EventTypePicker = ({ title, currEventType, setCurrEventType }) => {
  return (
    <div className="Control">
      <h3>{title}</h3>
      <div className="Modes">
        {supportedEventTypes.map((eventType, idx) => (
          <div
            key={idx}
            className={["Mode", currEventType === eventType ? "Active" : null].join(
              " "
            )}
            onClick={() => {
                setCurrEventType(eventType);
            }}
          >
            {eventType}
          </div>
        ))}
      </div>
    </div>
  );
};

const EventType = ({ currEventType, changeCurrEventType }) => {
  return (
    <EventTypePicker
      title={"Transition Type:"}
      currEventType={currEventType}
      setCurrEventType={changeCurrEventType}
    />
  );
};

const Delete = ({ selectedStateObjectId, deleteSelectedStateObject }) => {
  return (
    <div className="Control">
      <h3>Delete:</h3>
      <div className="DeleteButtonsContainer">
        <button
          onClick={() => deleteSelectedStateObject()}
          disabled={!selectedStateObjectId}
          style={{
            cursor: !selectedStateObjectId ? "not-allowed" : null,
          }}
        >
          <FaTrash className="ButtonIcon" /> Delete
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
    currStateType,
    changeCurrStateType,
    currEventType,
    changeCurrEventType,
    selectedStateObjectId,
    deleteSelectedStateObject,
    bindStateDiagram,
  } = useContext(ControlContext);

  var currOptions = undefined;

  if(currMode === "cursor"){
    currOptions = undefined;
  }
  else if(currMode === "transition"){
    currOptions = <EventType
                    currMode={currMode}
                    currEventType={currEventType}
                    changeCurrEventType={changeCurrEventType}
                  />
  }
  else if(currMode === "stateObject"){
    currOptions = <StateType
                    currMode={currMode}
                    currStateType={currStateType}
                    changeCurrStateType={changeCurrStateType}
                    currEventType={currEventType}
                  />
  }

  return (
    <div className="ControlPanel">
      <Modes
        currMode={currMode}
        changeCurrMode={changeCurrMode}
        currStateType={currStateType}
        currEventType={currEventType}
      />

      {currOptions}

      <Delete
        selectedStateObjectId={selectedStateObjectId}
        deleteSelectedStateObject={deleteSelectedStateObject}
      />
      <button onClick={bindStateDiagram}> Run </button>
    </div>
  );
};

export default ControlPanel;
