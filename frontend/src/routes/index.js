import DashBoard from "../pages/DashBoard";
import Register from "../pages/DashBoard/Register";
import FeeMange from "../pages/FeeMange";
import Detail from "../pages/FeeMange/Detail";
import FeeList from "../pages/FeeMange/FeeList";
import LayoutDefault from "../pages/Layout/LayoutDefault";
import LogIn from "../pages/LogIn/LogIn";
import Password from "../pages/Password";
import Stats from "../pages/Stats";
import HouseholdInfo from "../pages/DashBoard/HouseholdInfo";
import TransactionHistory from "../pages/FeeMange/TransactionHistory";
import { Navigate } from "react-router-dom";
import ProfilePage from "../pages/ProfilePage";
import ResidentList from "../pages/DashBoard/ResidentList";
import VehicleMange from "../pages/VehicleManage";

export const routes = [
  {
    path: "/",
    element: <Navigate to='dashboard' replace/>,
  },
  {
    path: "login",
    element: <LogIn/>
  },
  {
    path: "/",
    element: <LayoutDefault/>,
    children: [
      {
        path: "dashboard",
        element: <DashBoard/>
      },
      {
        path: "view_all",
        element: <ResidentList/>
      },
      {
        path: "register_resident",
        element: <Register/>
      },
      {
        path: "household_infor",
        element: <HouseholdInfo />
      },
      {
        path: "stats",
        element: <Stats/>
      },
      {
        path: "vehicle_manage",
        element: <VehicleMange/>
      },
      {
        path: "fee_manage",
        element: <FeeMange/>
      },
      {
        path: "fee_list",
        element: <FeeList/>
      },
      {
        path: "transactionHis/:household_id",
        element: <TransactionHistory/>
      },
      {
        path: "detail/:household_id",
        element: <Detail/>
      },
      {
        path: "password",
        element: <Password/>
      },
      {
        path: "profile",
        element: <ProfilePage/>
      }
    ]
  }
]