import React from "react";

export default ({
  id,
  cx,
  cy,
  nodeName,
  highlighted,
  filter,
}) => {
  var borderColor;
  if(highlighted){
    borderColor = "yellow";
  }
  else{
    borderColor = "black";
  }
  return (
    <>
      <ellipse
        id={id}
        cx={cx}
        cy={cy}
        rx={30}
        ry={30}
        fill="white"
        stroke={borderColor}
        strokeWidth="2px"
        filter={filter}
      />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
      >{nodeName}</text>
    </>
  );
};
