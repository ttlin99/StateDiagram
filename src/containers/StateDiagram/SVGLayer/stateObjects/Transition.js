import React from "react";

export default ({ id, x1, x2, y1, y2, eventType, objectType, behavior, filter }) => {

  return (
    <>
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="18" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#000" />
        </marker>
      </defs>

      <line
        id={id}
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="black"
        strokeWidth="3"
        markerEnd="url(#arrow)"
        filter={filter}
      />
      <text
        x={((x1+x2)/2)}
        y={(((y1+y2)/2)-10)}
        fontSize="10px"
        textAnchor="middle">{eventType} on {objectType}</text>
      <text
          x={((x1+x2)/2)}
          y={(((y1+y2)/2)+20)}
          fontSize="10px"
          textAnchor="middle">{behavior}</text>
    </>
  );
};
