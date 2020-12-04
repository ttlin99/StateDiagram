import React, { Component } from "react";

import ControlPanel from "./containers/ControlPanel/ControlPanel";
import Workspace from "./containers/Workspace/Workspace";
import StateDiagram from "./containers/StateDiagram/StateDiagram";

import ControlContext from "./contexts/control-context";
import { genId, defaultValues } from "./shared/util";

import "./App.css";

class App extends Component {
  state = {
    // controls
    currMode: defaultValues.mode,
    currStateType: defaultValues.stateType,
    currEventType: defaultValues.eventType,

    // workspace
    stateObjects: [],
    stateObjectsMap: {},
    selectedStateObjectId: undefined,

    // handling undo/redo
    commandList: [],
    currCommand: -1,

    // state diagram
    currStateInDiagram: defaultValues.stateDiagramStart,
  };

  constructor() {
    super();
  }

  // add the shapeId to the array, and the shape itself to the map
  addStateObject = (shapeData) => {
    let stateObjects = [...this.state.stateObjects];
    let stateObjectsMap = { ...this.state.stateObjectsMap };
    const id = genId();
    stateObjectsMap[id] = {
      ...shapeData,
      id,
    };
    stateObjects.push(id);
    this.setState({ stateObjects, stateObjectsMap, selectedStateObjectId: id });
  };

  // get the shape by its id, and update its properties
  updateStateObject = (shapeId, newData) => {
    let stateObjectsMap = { ...this.state.stateObjectsMap };
    let targetStateObject = stateObjectsMap[shapeId];
    stateObjectsMap[shapeId] = { ...targetStateObject, ...newData };
    this.setState({ stateObjectsMap });
  };

  moveStateObject = (newData) => {
    if (this.state.selectedStateObjectId) {
      this.updateStateObject(this.state.selectedStateObjectId, newData);
    }
  };

  // deleting a shape sets its visibility to false, rather than removing it
  deleteSelectedStateObject = () => {
    let stateObjectsMap = { ...this.state.stateObjectsMap };
    stateObjectsMap[this.state.selectedStateObjectId].visible = false;
    this.setState({ stateObjectsMap, selectedStateObjectId: undefined });
  };

  changeCurrMode = (mode) => {
    this.setState({ currMode: mode });
  };

  changeCurrStateType = (stateType) => {
    this.setState({ currStateType: stateType });
    if (this.state.selectedStateObjectId) {
      this.updateStateObject(this.state.selectedStateObjectId, { stateType });
    }
  };

  changeCurrEventType = (eventType) => {
    this.setState({ currEventType: eventType });
    if (this.state.selectedStateObjectId) {
      this.updateStateObject(this.state.selectedStateObjectId, { eventType });
    }
  };

  bindStateDiagram = () => {

    //placeholder for actual transitions parsed from state diagram drawn by user
    var transitionsDict = {
      mousedown: {"default": "moving"},
      mouseup: {"moving": "dblclick"},

    };

    window.addEventListener('mousedown', (e) => {
      if (e.target.className === 'targetObject') {
        if (!transitionsDict.mousedown) return;

        var transition = transitionsDict.mousedown[this.state.currStateInDiagram];
        if (transition) {
          this.setState({ currStateInDiagram: transition });
        }
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.target.className === 'targetObject') {
        if (!transitionsDict.mouseup) return;

        var transition = transitionsDict.mouseup[this.state.currStateInDiagram];
        if (transition) {
          this.setState({ currStateInDiagram: transition });
        }
      }
    });

    window.addEventListener('dblclick', (e) => {
      if (e.target.className === 'targetObject') {
        if (!transitionsDict.dblclick) return;

        var transition = transitionsDict.dblclick[this.state.currStateInDiagram];
        if (transition) {
          this.setState({ currStateInDiagram: transition });
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (this.currStateInDiagram === 'moving') {
        //move selected object
      }
    });

  }

  render() {
    const {
      currMode,
      currStateType,
      currEventType,
      stateObjects,
      stateObjectsMap,
      selectedStateObjectId,
    } = this.state;

    // update the context with the functions and values defined above and from state
    // and pass it to the structure below it (control panel and workspace)
    return (
      <React.Fragment>
        <ControlContext.Provider
          value={{
            currMode,
            changeCurrMode: this.changeCurrMode,
            currStateType,
            changeCurrStateType: this.changeCurrStateType,
            changeCurrBorderWidth: this.changeCurrBorderWidth,
            currEventType,
            changeCurrEventType: this.changeCurrEventType,

            stateObjects,
            stateObjectsMap,
            addStateObject: this.addStateObject,
            moveStateObject: this.moveStateObject,
            selectedStateObjectId,
            selectStateObject: (id) => {
              this.setState({ selectedStateObjectId: id });
              if (id) {
                const { stateType, eventType } = stateObjectsMap[
                  stateObjects.filter((stateObjectId) => stateObjectId === id)[0]
                ];
                this.setState({
                  currStateType: stateType,
                  currEventType: eventType,
                });
              }
            },
            deleteSelectedStateObject: this.deleteSelectedStateObject,
            bindStateDiagram: this.bindStateDiagram
          }}
        >
          <ControlPanel />
          <StateDiagram />
          <Workspace/>
        </ControlContext.Provider>
      </React.Fragment>
    );
  }
}

export default App;
