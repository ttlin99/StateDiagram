import React from "react";

export default ({
  id,
  cx,
  cy,
  stateType,
  filter,
}) => {
  return (
    <>
      <ellipse
        id={id}
        cx={cx}
        cy={cy}
        rx={40}
        ry={40}
        fill="white"
        stroke="black"
        strokeWidth="2px"
        filter={filter}
      />
      <text
        x={cx}
        y={cy}
        text-anchor="middle"
      >{stateType}</text>
    </>
  );
};
