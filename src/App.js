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
    currStateObjectName: defaultValues.nodeName,
    currEventType: defaultValues.eventType,
    currBehavior: defaultValues.behavior,
    currObjectType: defaultValues.objectType,

    // workspace
    stateObjects: ["start"],
    stateObjectsMap: {
      start: {
        finalCoords: {x: 100, y: 100},
        id: "start",
        initCoords: {x: 100, y: 100},
        nodeName: "0",
        type: "node",
        visible: true,
        incomingTransitions: [],
        outgoingTransitions: [],

      }},
    selectedStateObjectId: undefined,

    // maps transitionId to transition data: eventType, behavior, object
    transitionData: {},

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
    let transitionData = { ...this.state.transitionData };
    const id = genId();
    stateObjectsMap[id] = {
      ...shapeData,
      id,
    };
    stateObjects.push(id);
    if(shapeData.type === "transition"){
      let startStateId = shapeData.startState;
      let endStateId = shapeData.endState;
      let startStateData = stateObjectsMap[startStateId];
      let endStateData = stateObjectsMap[endStateId];
      if(startStateData && endStateData){
        let startStateOutgoing = startStateData.outgoingTransitions;
        let endStateIncoming = endStateData.incomingTransitions;

        startStateOutgoing.push(id);
        endStateIncoming.push(id);
        transitionData[id] = ({ eventType: this.state.currEventType,
                                behavior: this.state.currBehavior,
                                object: this.state.currObjectType });

        stateObjectsMap[startStateId] = {
          ...startStateData,
          outgoingTransitions: startStateOutgoing,
        };

        stateObjectsMap[endStateId] = {
          ...endStateData,
          incomingTransitions: endStateIncoming,
        };

      }
    }
    this.setState({ stateObjects, stateObjectsMap, transitionData, selectedStateObjectId: id });
  };

  // get the shape by its id, and update its properties
  updateStateObject = (shapeId, newData) => {
    let stateObjectsMap = { ...this.state.stateObjectsMap };
    let targetStateObject = stateObjectsMap[shapeId];
    stateObjectsMap[shapeId] = { ...targetStateObject, ...newData };
    this.setState({ stateObjectsMap });
  };

  updateTransitionData = (shapeId, newData) => {
    let transitionData = { ...this.state.transitionData };
    let targetTransition = this.state.transitionData[shapeId];
    transitionData[shapeId] = { ...targetTransition, ...newData };
    this.setState({ transitionData });
  }

  moveNode = (newData) => {
    if (this.state.selectedStateObjectId) {
      let stateObjectsMap = { ...this.state.stateObjectsMap };
      let targetStateObject = stateObjectsMap[this.state.selectedStateObjectId];
      stateObjectsMap[this.state.selectedStateObjectId] = { ...targetStateObject, ...newData };
      if(targetStateObject.type === "node"){
        for(var i = 0; i < targetStateObject.incomingTransitions.length; i++){
          let currId = targetStateObject.incomingTransitions[i];
          let currTransitionData = stateObjectsMap[currId];
          stateObjectsMap[currId] = {...currTransitionData, finalCoords: newData.finalCoords,};
        }
        for(var j = 0; j < targetStateObject.outgoingTransitions.length; j++){
          let currId = targetStateObject.outgoingTransitions[j];
          let currTransitionData = stateObjectsMap[currId];
          stateObjectsMap[currId] = {...currTransitionData, initCoords: newData.finalCoords,};
        }
      }
      this.setState({ stateObjectsMap });
    }
  };

  // deleting a shape sets its visibility to false, rather than removing it
  deleteSelectedStateObject = () => {
    let stateObjectsMap = { ...this.state.stateObjectsMap };
    stateObjectsMap[this.state.selectedStateObjectId].visible = false;

    let targetStateObject = stateObjectsMap[this.state.selectedStateObjectId];

    if(targetStateObject.type === "node") {
      // sets all incoming transitions' visibilities to false
      for(var i = 0; i < targetStateObject.incomingTransitions.length; i++){
        let currId = targetStateObject.incomingTransitions[i];
        stateObjectsMap[currId].visible = false;
      }
      // sets all outgoing transitions' visibilities to false
      for(var j = 0; j < targetStateObject.outgoingTransitions.length; j++){
        let currId = targetStateObject.outgoingTransitions[j];
        stateObjectsMap[currId].visible = false;
      }
    }

    this.setState({ stateObjectsMap, selectedStateObjectId: undefined });
  };

  resetStateDiagram = () => {
    let stateObjectsMap = {
      start: {
        finalCoords: {x: 100, y: 100},
        id: "start",
        initCoords: {x: 100, y: 100},
        nodeName: "0",
        type: "node",
        visible: true,
        incomingTransitions: [],
        outgoingTransitions: [],
      }};
    let stateObjects = ["start"];
    this.setState({ stateObjectsMap, stateObjects, selectedStateObjectId: undefined });
  };

  changeCurrMode = (mode) => {
    this.setState({ currMode: mode });
  };

  changeCurrNodeName = (nodeName) => {
    this.setState({ currNodeName: nodeName });
    if (this.state.selectedStateObjectId) {
      this.updateStateObject(this.state.selectedStateObjectId, { nodeName });
    }
  };

  changeCurrEventType = (eventType) => {
    this.setState({ currEventType: eventType });
    if (this.state.selectedStateObjectId) {
      this.updateStateObject(this.state.selectedStateObjectId, { eventType });
      this.updateTransitionData(this.state.selectedStateObjectId, { eventType });
    }
  };

  changeCurrBehavior = (behavior) => {
    this.setState({ currBehavior: behavior });
    if (this.state.selectedStateObjectId) {
      this.updateStateObject(this.state.selectedStateObjectId, { behavior });
      this.updateTransitionData(this.state.selectedStateObjectId, { behavior });
    }
  };

  changeCurrObjectType = (objectType) => {
    this.setState({ currObjectType: objectType });
    if (this.state.selectedStateObjectId) {
      this.updateStateObject(this.state.selectedStateObjectId, { objectType });
      this.updateTransitionData(this.state.selectedStateObjectId, { objectType });
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
      currNodeName,
      currEventType,
      currBehavior,
      currObjectType,
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
            currNodeName,
            changeCurrNodeName: this.changeCurrNodeName,
            currEventType,
            changeCurrEventType: this.changeCurrEventType,
            currBehavior,
            changeCurrBehavior: this.changeCurrBehavior,
            currObjectType,
            changeCurrObjectType: this.changeCurrObjectType,
            resetStateDiagram: this.resetStateDiagram,

            stateObjects,
            stateObjectsMap,
            addStateObject: this.addStateObject,
            moveNode: this.moveNode,
            selectedStateObjectId,
            selectStateObject: (id) => {
              this.setState({ selectedStateObjectId: id });
              if (id) {
                const { nodeName } = stateObjectsMap[
                  stateObjects.filter((stateObjectId) => stateObjectId === id)[0]
                ];
                this.setState({
                  currNodeName: nodeName,
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
