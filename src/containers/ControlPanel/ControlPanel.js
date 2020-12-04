import React, { useContext } from "react";

import { FaTrash } from "react-icons/fa";

import CursorImg from "../../assets/img/cursor.png";
import TransitionImg from "../../assets/img/transition.png";
import StateObjectImg from "../../assets/img/state.png";
import supportedStateTypes from "../../shared/supportedStateTypes";
import supportedEventTypes from "../../shared/supportedEventTypes";
import supportedObjectTypes from "../../shared/supportedObjectTypes";
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

const StateType = ({
  currStateType,
  changeCurrStateType,
}) => {
  return (
    <OptionPicker
      title={"State Type:"}
      currSelected={currStateType}
      setOption={changeCurrStateType}
      allOptions={supportedStateTypes}
    />
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

const Run = ({run}) => {
  return (
    <div className="Control">
      <h3>Run:</h3>
      <div className="DeleteButtonsContainer">
        <button onClick={run}> Run </button>{" "}
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
    currObjectType,
    changeCurrObjectType,
    selectedStateObjectId,
    deleteSelectedStateObject,
    bindStateDiagram,
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

                  </>
    );
  }
  else if(currMode === "stateObject"){
    currOptions = <StateType
                    currStateType={currStateType}
                    changeCurrStateType={changeCurrStateType}
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

      <Run
        run={bindStateDiagram}
      />

    </div>
  );
};

export default ControlPanel;
