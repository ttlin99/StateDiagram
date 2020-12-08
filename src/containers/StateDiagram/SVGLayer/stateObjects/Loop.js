import React from "react";

export default ({
  id,
  cx,
  cy,
  eventType,
  objectType,
  behavior,
  filter,
}) => {
  return (
    <svg version="1.1" x={cx-60} y={cy-60} width="100%" height="100%">
      <path fill='blue' transform='translate(70 0) scale(-1,1)' d="M41.38,0C28.652,0,17.979,8.939,15.29,20.867l-4.319-5.27l-3.867,3.17l9.904,12.083l12.083-9.904l-3.17-3.867l-5.705,4.676
        C22.48,12.163,31.107,5,41.38,5c11.992,0,21.749,9.757,21.749,21.749c0,11.993-9.757,21.75-21.749,21.75h-6.147
        c-1.427-8.156-8.543-14.38-17.104-14.38c-9.582,0-17.379,7.796-17.379,17.38s7.797,17.38,17.379,17.38
        c8.906,0,16.26-6.736,17.257-15.38h5.994c14.749,0,26.749-12,26.749-26.75C68.129,12,56.129,0,41.38,0z M18.129,62.383
        c-6.002,0-10.885-4.882-10.885-10.885s4.883-10.885,10.885-10.885s10.885,4.882,10.885,10.885S24.131,62.383,18.129,62.383z"/>
      <text
        x="70"
        y="10"
        fill="white"
        fontSize="10px"
        textAnchor="middle">{eventType} on {objectType}</text>
      <text
        x="30"
        y="30"
        fill="white"
        fontSize="10px"
        textAnchor="middle">{behavior}</text>

  </svg>
  );
};
