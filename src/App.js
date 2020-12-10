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
    currWorkspaceSelection: undefined,
    currWorkspaceMoving: undefined,

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

    // maps transitionId to transition data: eventType, behavior, object, endState
    transitionData: {},

    // handling undo/redo
    commandList: [],
    currCommand: -1,

    // state diagram
    currStateInDiagram: "start",

    //num of boxes in workspace currently
    numBoxes: 3,

    isClick: true,
  };

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
                                objectType: this.state.currObjectType,
                                endState: endStateId});

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
    this.setState({ stateObjects, stateObjectsMap, transitionData});
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

    if(this.currStateInDiagram === this.state.selectedStateObjectId){
      this.setState({ stateObjectsMap, selectedStateObjectId: undefined, currStateInDiagram: 'start' });
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
    this.setState({ stateObjectsMap, stateObjects, selectedStateObjectId: undefined, currStateInDiagram: "start" });
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

  noConflictingTransitions = (stateId, eventType, objectType) => {
    let targetNodeTransitions = this.state.stateObjectsMap[stateId].outgoingTransitions;
    var i;
    for( i = 0; i < targetNodeTransitions.length; i++){
      let currTransition = this.state.stateObjectsMap[targetNodeTransitions[i]];
      if(currTransition.visible && currTransition.eventType === eventType && currTransition.objectType === objectType){
        console.log( this.state.stateObjectsMap[stateId].nodeName + " already has a transition that handles " + eventType + " on " +objectType);
        return false;
      }
    }
    return true;
  };

  doAction = (behavior, event) => {
    switch(behavior){
      case "none":
        break;
      case "select target":
        if(event.target.className === "targetObject"){
          let currTarget = document.getElementById(event.target.id);
          let prevSelection = this.state.currWorkspaceSelection;
          if(prevSelection){
            prevSelection.style.background = "red";
          }
          if(currTarget){
            currTarget.style.background = "blue";
          }
          this.setState({ currWorkspaceSelection: currTarget });
        }
        break;
      case "deselect target":
        let prevSelection = this.state.currWorkspaceSelection;
        if(prevSelection){
          prevSelection.style.background = "red";
        }
        this.setState({ currWorkspaceSelection: undefined });
        break;
      case "move selected":
        let currTarget = this.state.currWorkspaceSelection;
        if(currTarget){
            let workspace = document.getElementById("Workspace");
            if (event.target.className == 'Workspace') {
              let xTransform = event.nativeEvent.offsetX - 50;
              let yTransform = event.nativeEvent.offsetY - 50;
              let right = workspace.clientWidth;
              let bottom = workspace.clientHeight;
              if (0 <= xTransform  && xTransform + 100 <= right && 0 <= yTransform && yTransform + 100 <= bottom) {
                currTarget.style.left = xTransform + "px";
                currTarget.style.top = yTransform + "px";
              }
            }
            else {
              let container = document.getElementById(event.target.id);
              let xTransform = event.nativeEvent.offsetX + parseInt(container.style.left,10) - 50;
              let yTransform = event.nativeEvent.offsetY + parseInt(container.style.top,10) - 50;
              let right = workspace.clientWidth;
              let bottom = workspace.clientHeight;
              if (0 <= xTransform && xTransform + 100 <= right && 0 <= yTransform && yTransform + 100 <= bottom) {
                currTarget.style.left = xTransform + 'px';
                currTarget.style.top = yTransform + 'px';
              }
            }
        }
        break;
      case "start move object":
        if(event.target.className === "targetObject"){
          let currTarget = document.getElementById(event.target.id);
          this.setState({ currWorkspaceMoving: currTarget });
        }
        break;
      break;
      case "stop move object":
        this.setState({ currWorkspaceMoving: undefined });
        break;
      case "move object":
        let currMoving = this.state.currWorkspaceMoving;
        if(currMoving){
            let workspace = document.getElementById("Workspace");
            if (event.target.className == 'Workspace') {
              let xTransform = event.nativeEvent.offsetX - 50;
              let yTransform = event.nativeEvent.offsetY - 50;
              let right = workspace.clientWidth;
              let bottom = workspace.clientHeight;
              if (0 <= xTransform  && xTransform + 100 <= right && 0 <= yTransform && yTransform + 100 <= bottom) {
                currMoving.style.left = xTransform + "px";
                currMoving.style.top = yTransform + "px";
              }
            }
            else {
              let container = document.getElementById(event.target.id);
              let xTransform = event.nativeEvent.offsetX + parseInt(container.style.left,10) - 50;
              let yTransform = event.nativeEvent.offsetY + parseInt(container.style.top,10) - 50;
              let right = workspace.clientWidth;
              let bottom = workspace.clientHeight;
              if (0 <= xTransform && xTransform + 100 <= right && 0 <= yTransform && yTransform + 100 <= bottom) {
                currMoving.style.left = xTransform + 'px';
                currMoving.style.top = yTransform + 'px';
              }
            }
        }
        break;
      case "create box":
        let workspace = document.getElementById("Workspace");
        if (event.target.className == 'Workspace') {
          let xTransform = event.nativeEvent.offsetX - 50;
          let yTransform = event.nativeEvent.offsetY - 50;
          let right = workspace.clientWidth;
          let bottom = workspace.clientHeight;
          if (0 <= xTransform  && xTransform + 100 <= right && 0 <= yTransform && yTransform + 100 <= bottom) {
            var box = document.createElement("div");
            box.style.width = "100px";
            box.style.height = "100px";
            box.style.left = xTransform + 'px';
            box.style.top = yTransform + 'px';
            box.classList.add("targetObject");
            box.id = 'box' + (this.state.numBoxes + 1);
            workspace.appendChild(box);
            this.setState({numBoxes: this.state.numBoxes + 1});
          }
        }
        else {
          let container = document.getElementById(event.target.id);
          let xTransform = event.nativeEvent.offsetX + parseInt(container.style.left,10) - 50;
          let yTransform = event.nativeEvent.offsetY + parseInt(container.style.top,10) - 50;
          let right = workspace.clientWidth;
          let bottom = workspace.clientHeight;
          if (0 <= xTransform && xTransform + 100 <= right && 0 <= yTransform && yTransform + 100 <= bottom) {
            var box = document.createElement("div");
            box.style.width = "100px";
            box.style.height = "100px";
            box.style.left = xTransform + 'px';
            box.style.top = yTransform + 'px';
            box.classList.add("targetObject");
            box.id = 'box' + (this.state.numBoxes + 1);
            workspace.appendChild(box);
            this.setState({numBoxes: this.state.numBoxes + 1});
          }
        }

      default:

    }
  }

  handleEventInput = (e) => {
    let currEvent = e.type;
    let currState = this.state.currStateInDiagram;
    let currStateData = this.state.stateObjectsMap[currState];
    if (currEvent == "mousedown") this.setState({ isClick: true });
    if (currEvent == "mousemove") this.setState({ isClick: false });
    if (!currStateData.outgoingTransitions) return;

    let currObject = undefined;
    if(e.target.className === "Workspace"){
      currObject = "work space";
    }
    else{
      currObject = "target"
    }

    for (var i = 0; i < currStateData.outgoingTransitions.length; i++) {
      let transitionId = currStateData.outgoingTransitions[i];
      let transitionData = this.state.stateObjectsMap[transitionId];
      if(transitionData.visible){
      switch(currEvent) {
        case "mousemove":
          if(transitionData.eventType === "mouse move" && transitionData.objectType === currObject){
            this.doAction(transitionData.behavior, e);
            this.setState({ currStateInDiagram: transitionData.endState, isClick: false});
          }
          break;
        case "mousedown":
          if(transitionData.eventType === "mouse down" && transitionData.objectType === currObject){
            this.doAction(transitionData.behavior, e);
            this.setState({ currStateInDiagram: transitionData.endState});
          }
          break;
        case "mouseup":
          if(transitionData.eventType === "mouse up" && transitionData.objectType === currObject){
            this.doAction(transitionData.behavior, e);
            this.setState({ currStateInDiagram: transitionData.endState});
          }
          break;
        case "click":
          if(transitionData.eventType === "click" && transitionData.objectType === currObject){
            if (this.state.isClick) {
              this.doAction(transitionData.behavior, e);
              this.setState({ currStateInDiagram: transitionData.endState, isClick: true});
            }
          }
          break;
        case "dblclick":
          if(transitionData.eventType === "double click" && transitionData.objectType === currObject){
            this.doAction(transitionData.behavior, e);
            this.setState({ currStateInDiagram: transitionData.endState});
          }
          break;
        default:
          // code block
        }
      }
    }

  };

  render() {
    const {
      currMode,
      currNodeName,
      currEventType,
      currBehavior,
      currObjectType,
      currStateInDiagram,
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
            currStateInDiagram,
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
            noConflictingTransitions: this.noConflictingTransitions,
            handleEventInput: this.handleEventInput,
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
