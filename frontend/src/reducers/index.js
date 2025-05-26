import {combineReducers} from "redux";
import passwordReducer from "./password";
import page1Reducer from "./page1";
import feeDetailReducer from "./feeDetail";
import householdDetailReducer from "./feeDetail2";
import feeDetailReducerDone from "./feeDetail3";
import feeManageReducer from "./feeManage";
import feeManageReducer1 from "./feeManage1";
import feePageReducer from "./feePage";
import chartReducer from "./chart";

const allReducers = combineReducers({
  passwordReducer,
  page1Reducer,
  feeDetailReducer,
  feeDetailReducerDone,
  householdDetailReducer,
  feeManageReducer,
  feeManageReducer1,
  chartReducer,
  feePageReducer
  //Thêm nhiều reducer ở đây
})

export default allReducers;