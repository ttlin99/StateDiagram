import { v4 as uuidv4 } from "uuid";

export const genId = () => {
  // return new Date().getTime().toString();
  return uuidv4();
};

export const selectShadowId = "select-shadow";

export const defaultValues = {
  mode: "node",
  stateType: "default",
  eventType: "mouse down",
  objectType: "work space",
  behavior: "none",
};
