import React from "react";

export default ({ id, x, y, width, height, filter }) => {
  return (
    <rect
      id={id}
      top={x}
      left={y}
      width={100}
      height={100}
      backgroundColor="red"
      stroke="black"
      strokeWidth="3"
      filter={filter}
    />
  );
};
