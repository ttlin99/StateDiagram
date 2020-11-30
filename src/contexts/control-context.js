import { createContext } from "react";

// create a context with default values
const controlContext = createContext({
  currMode: "",
  changeCurrMode: () => {},
  currStateType: "",
  changeCurrStateType: () => {},
  currEventColor: "",
  changeCurrEventColor: () => {},

  stateObjects: [],
  stateObjectsMap: {},
  addStateObject: () => {},
  moveStateObject: () => {},
  selectedStateObjectId: "", // a string or undefined
  selectStateObject: () => {},
  deleteSelectedStateObject: () => {},

});

export default controlContext;
