import React, { useEffect, useCallback, useContext, useState } from "react";

import Transition from "./stateObjects/Transition";
import StateObject from "./stateObjects/StateObject";

import ControlContext from "../../../contexts/control-context";
import { selectShadowId } from "../../../shared/util";

const SVGLayer = () => {
  const {
    currMode,
    currStateType,
    currEventType,
    stateObjects,
    stateObjectsMap,
    addStateObject,
    moveStateObject,
    selectedStateObjectId,
    selectStateObject,
  } = useContext(ControlContext);

  // use useState to set elements in the React state directly
  // the first element of the list is the state value
  // the second element of the list is a function to update the state value in the future
  const [drawing, setDrawing] = useState(false);
  const [initPoint, setInitPoint] = useState({ x: undefined, y: undefined });
  const [currPoint, setCurrPoint] = useState({ x: undefined, y: undefined });

  const [dragging, setDragging] = useState(false);
  const [draggingStateObject, setDraggingStateObject] = useState(undefined);
  const [mouseDownPoint, setMouseDownPoint] = useState({
    x: undefined,
    y: undefined,
  });

  const handleMouseDown = (e) => {
    if (currMode !== "select") {
      // should create
      setDrawing(true);
      setInitPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      setCurrPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
      e.preventDefault();
    } else {
      // should select
      if (e.target.nodeName === "svg") {
        // deselect
        selectStateObject(undefined);
      } else {
        // select
        const targetId = e.target.id;
        selectStateObject(targetId);
        setDragging(true);
        setMouseDownPoint({
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        });
        setDraggingStateObject(
          stateObjectsMap[stateObjects.filter((stateObjectId) => stateObjectId === targetId)[0]]
        );
      }
    }
  };

  const handleMouseMove = (e) => {
    if (drawing) {
      setCurrPoint({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    } else if (dragging && draggingStateObject) {
      const deltaX = e.nativeEvent.offsetX - mouseDownPoint.x;
      const deltaY = e.nativeEvent.offsetY - mouseDownPoint.y;

      moveStateObject({
        initCoords: {
          x: draggingStateObject.initCoords.x + deltaX,
          y: draggingStateObject.initCoords.y + deltaY,
        },
        finalCoords: {
          x: draggingStateObject.finalCoords.x + deltaX,
          y: draggingStateObject.finalCoords.y + deltaY,
        },
      });
    }
  };

  const handleMouseUp = (e) => {
    if (currMode !== "select") {

      addStateObject({
        type: currMode,
        visible: true,
        initCoords: initPoint,
        finalCoords: currPoint,
        stateType: currStateType,
        eventType: currEventType,
      });
      setDrawing(false);
      setInitPoint({ x: undefined, y: undefined });
      setCurrPoint({ x: undefined, y: undefined });
    }
    else if (dragging){
      let finalValues = {
        x: e.nativeEvent.offsetX,
        y: e.nativeEvent.offsetY,
      };
      setDragging(false);
      setDraggingStateObject(undefined);
      setMouseDownPoint({ x: undefined, y: undefined });
    }
    else {
      setDragging(false);
      setDraggingStateObject(undefined);
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
          moveStateObject({
            initCoords: {
              x: draggingStateObject.initCoords.x,
              y: draggingStateObject.initCoords.y,
            },
            finalCoords: {
              x: draggingStateObject.finalCoords.x,
              y: draggingStateObject.finalCoords.y,
            },
          });
          setDragging(false);
          setDraggingStateObject(undefined);
          setMouseDownPoint({ x: undefined, y: undefined });
        }
      }
    },
    [drawing, dragging, draggingStateObject, moveStateObject]
  );

  // useEffect will run after the render is committed to the screen
  // the first argument is the function that will run
  // the second argument are the dependencies, meaning this will only run when there is a change in these values
  useEffect(() => {
    window.addEventListener("keydown", escKeyDownHandler, true);
    return () => window.removeEventListener("keydown", escKeyDownHandler, true);
  }, [escKeyDownHandler]);

  const genStateObject = (stateObjectData, key = undefined) => {
    const {
      initCoords,
      finalCoords,
      stateType,
      eventType,
      id,
    } = stateObjectData;
    const filter =
      selectedStateObjectId && selectedStateObjectId === id
        ? `url(#${selectShadowId})`
        : null;
    switch (stateObjectData.type) {
      case "transition": {
        return React.createElement(Transition, {
          x1: initCoords.x,
          y1: initCoords.y,
          x2: finalCoords.x,
          y2: finalCoords.y,
          eventType,
          id,
          key,
          filter,
        });
      }
      case "stateObject": {
        let x = finalCoords.x;
        let y = finalCoords.y;

        return React.createElement(StateObject, {
          cx: x,
          cy: y,
          eventType,
          stateType,
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
      return genStateObject(stateObjectData, key);
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
        stateType: currStateType,
        eventType: currEventType,
      });
    }
  };

  return (
    <svg
      id="workspace-svg"
      width="800"
      height="400"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
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
        return renderStateObject(stateObjectsMap[stateObjectId], idx);
      })}
      {drawing && renderTempStateObject()}
    </svg>
  );
};

export default SVGLayer;
