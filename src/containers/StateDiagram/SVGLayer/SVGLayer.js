import React, { useEffect, useCallback, useContext, useState } from "react";

import Transition from "./stateObjects/Transition";
import Node from "./stateObjects/Node";
import Line from "./stateObjects/Line";
import Loop from "./stateObjects/Loop";


import ControlContext from "../../../contexts/control-context";
import { selectShadowId } from "../../../shared/util";

const SVGLayer = () => {
  const {
    currMode,
    currNodeName,
    currEventType,
    currObjectType,
    currBehavior,
    currStateInDiagram,
    stateObjects,
    stateObjectsMap,
    addStateObject,
    moveNode,
    selectedStateObjectId,
    selectStateObject,
    noConflictingTransitions,
  } = useContext(ControlContext);

  // use useState to set elements in the React state directly
  // the first element of the list is the state value
  // the second element of the list is a function to update the state value in the future
  const [drawing, setDrawing] = useState(false);
  const [initPoint, setInitPoint] = useState({ x: undefined, y: undefined });
  const [currPoint, setCurrPoint] = useState({ x: undefined, y: undefined });

  const [startState, setStartState] = useState(undefined);
  const [dragging, setDragging] = useState(false);
  const [draggingNode, setDraggingNode] = useState(undefined);
  const [mouseDownPoint, setMouseDownPoint] = useState({
    x: undefined,
    y: undefined,
  });

  const handleDoubleClick = (e) => {
    console.log(e.target.cx);
    if(currMode === "transition" && e.target.tagName === "ellipse"){
      addStateObject({
        type: currMode,
        visible: true,
        initCoords: { x: e.target.cx.baseVal.value, y: e.target.cy.baseVal.value },
        finalCoords: { x: e.target.cx.baseVal.value, y: e.target.cy.baseVal.value },
        eventType: currEventType,
        objectType: currObjectType,
        behavior: currBehavior,
        startState: e.target.id,
        endState: e.target.id
      });

    }
  }

  const handleMouseDown = (e) => {
    if (currMode === "node") {
      setDrawing(true);
      setInitPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      setCurrPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      e.preventDefault();
    }
    else if(currMode === "transition"){
      if(e.target.tagName  === "ellipse"){
        setDrawing(true);
        setInitPoint({ x: e.target.cx.baseVal.value, y: e.target.cy.baseVal.value });
        setCurrPoint({ x: e.target.cx.baseVal.value, y: e.target.cy.baseVal.value });
        setStartState(e.target.id);
        e.preventDefault();
      }
    }
    else {
      // should select
      if (e.target.nodeName === "svg") {
        // deselect
        selectStateObject(undefined);
      } else if(e.target.tagName === "ellipse"){
          const targetId = e.target.id;
          selectStateObject(targetId);
          setDragging(true);
          setMouseDownPoint({
            x: e.nativeEvent.offsetX,
            y: e.nativeEvent.offsetY,
          });
          setDraggingNode(
            stateObjectsMap[stateObjects.filter((stateObjectId) => stateObjectId === targetId)[0]]
          );
        }
        else{
          const targetId = e.target.id;
          selectStateObject(targetId);
        }
    }
  };

  const handleMouseMove = (e) => {
    if (drawing) {
      setCurrPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    } else if (dragging && draggingNode) {
      const deltaX = e.nativeEvent.offsetX - mouseDownPoint.x;
      const deltaY = e.nativeEvent.offsetY - mouseDownPoint.y;

      moveNode({
        initCoords: {
          x: draggingNode.initCoords.x + deltaX,
          y: draggingNode.initCoords.y + deltaY,
        },
        finalCoords: {
          x: draggingNode.finalCoords.x + deltaX,
          y: draggingNode.finalCoords.y + deltaY,
        },
      });
    }
  };

  const handleMouseUp = (e) => {
    if (currMode === "node" && drawing) {
      addStateObject({
        type: currMode,
        visible: true,
        initCoords: initPoint,
        finalCoords: currPoint,
        nodeName: currNodeName,
        incomingTransitions: [],
        outgoingTransitions: [],
      });
      setDrawing(false);
      setInitPoint({ x: undefined, y: undefined });
      setCurrPoint({ x: undefined, y: undefined });
    }
    else if (currMode === "transition" && drawing) {
      if(e.target.tagName === "ellipse" && e.target.id !== startState && noConflictingTransitions(startState, currEventType, currObjectType)){
        addStateObject({
          type: currMode,
          visible: true,
          initCoords: initPoint,
          finalCoords: { x: e.target.cx.baseVal.value, y: e.target.cy.baseVal.value },
          eventType: currEventType,
          objectType: currObjectType,
          behavior: currBehavior,
          startState: startState,
          endState: e.target.id
        });
        setStartState(undefined);
      }

      setDrawing(false);
      setInitPoint({ x: undefined, y: undefined });
      setCurrPoint({ x: undefined, y: undefined });
    }
    else if (dragging){
      setDragging(false);
      setDraggingNode(undefined);
      setMouseDownPoint({ x: undefined, y: undefined });
    }
    else {
      setDragging(false);
      setDraggingNode(undefined);
      setMouseDownPoint({ x: undefined, y: undefined });
    }
  };

  // useCallback gives a memoized version of the callback that changes when one of its dependencies change
  // the first argument is the function that will be run
  // the second is the dependencies that the function relies on
  const escKeyDownHandler = useCallback(
    (e) => {
      if (e.key === "Escape") {
        // abort
        if (drawing) {
          setDrawing(false);
          setInitPoint({ x: undefined, y: undefined });
          setCurrPoint({ x: undefined, y: undefined });
        } else if (dragging) {
          moveNode({
            initCoords: {
              x: draggingNode.initCoords.x,
              y: draggingNode.initCoords.y,
            },
            finalCoords: {
              x: draggingNode.finalCoords.x,
              y: draggingNode.finalCoords.y,
            },
          });
          setDragging(false);
          setDraggingNode(undefined);
          setMouseDownPoint({ x: undefined, y: undefined });
        }
      }
    },
    [drawing, dragging, draggingNode, moveNode]
  );

  // useEffect will run after the render is committed to the screen
  // the first argument is the function that will run
  // the second argument are the dependencies, meaning this will only run when there is a change in these values
  useEffect(() => {
    window.addEventListener("keydown", escKeyDownHandler, true);
    return () => window.removeEventListener("keydown", escKeyDownHandler, true);
  }, [escKeyDownHandler]);

  const genStateObject = (stateObjectData, temp, key = undefined) => {
    const {
      initCoords,
      finalCoords,
      nodeName,
      eventType,
      objectType,
      behavior,
      id,
    } = stateObjectData;
    const filter =
      selectedStateObjectId && selectedStateObjectId === id
        ? `url(#${selectShadowId})`
        : null;
    switch (stateObjectData.type) {
      case "transition": {
        if(temp){
          return React.createElement(Line, {
            x1: initCoords.x,
            y1: initCoords.y,
            x2: finalCoords.x,
            y2: finalCoords.y,
            id,
            key,
            filter,
          });
        }
        else if(stateObjectData.startState === stateObjectData.endState){
          let x = finalCoords.x;
          let y = finalCoords.y;

          return React.createElement(Loop, {
            cx: x,
            cy: y,
            eventType,
            objectType,
            behavior,
            id,
            key,
            filter,
          });
        }
        else{
          return React.createElement(Transition, {
            x1: initCoords.x,
            y1: initCoords.y,
            x2: finalCoords.x,
            y2: finalCoords.y,
            eventType,
            objectType,
            behavior,
            id,
            key,
            filter,
          });
        }
      }
      case "node": {
        let x = finalCoords.x;
        let y = finalCoords.y;
        let isCurrState = false;

        if(id === currStateInDiagram){
          isCurrState = true;
        }

        return React.createElement(Node, {
          cx: x,
          cy: y,
          highlighted: isCurrState,
          nodeName,
          id,
          key,
          filter,
        });
      }
      default: {
        return null;
      }
    }
  };

  const renderStateObject = (stateObjectData, key) => {
    if (stateObjectData.visible) {
      return genStateObject(stateObjectData, false, key);
    } else {
      return null;
    }
  };

  const renderTempStateObject = () => {
    if (
      initPoint.x !== undefined &&
      initPoint.y !== undefined &&
      currPoint.x !== undefined &&
      currPoint.y !== undefined
    ) {
      return genStateObject({
        type: currMode,
        initCoords: initPoint,
        finalCoords: currPoint,
        nodeName: currNodeName,
        eventType: currEventType,
        objectType: currObjectType,
        behavior: currBehavior,
      }, true);
    }
  };

  return (
    <svg
      id="workspace-svg"
      width="800"
      height="400"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onDoubleClick={handleDoubleClick}
      onMouseUp={handleMouseUp}
    >
      <filter
        id={selectShadowId}
        x="-100%"
        y="-100%"
        width="400%"
        height="400%"
      >
        <feDropShadow
          dx="0"
          dy="0"
          stdDeviation="15"
          floodColor="rgba(0, 0, 0, 0.7)"
        />
      </filter>
      {stateObjects.map((stateObjectId, idx) => {
        if(stateObjectsMap[stateObjectId].type === "transition"){
          return renderStateObject(stateObjectsMap[stateObjectId], idx);
        }
      })}
      {drawing && renderTempStateObject()}

      {stateObjects.map((stateObjectId, idx) => {
        if(stateObjectsMap[stateObjectId].type === "node"){
          return renderStateObject(stateObjectsMap[stateObjectId], idx);
        }
      })}
    </svg>
  );
};

export default SVGLayer;
