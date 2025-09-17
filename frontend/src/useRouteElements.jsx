import { useRoutes } from "react-router-dom";
import OwnerLogin from "./components/owner/OwnerLogin";
import OwnerDashboard from "./components/owner/OwnerDashboard";
import EmployeeLogin from "./components/employee/EmployeeLogin";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";

export default function useRouteElements() {
    const routeElements = useRoutes([
        {
            path: "/",
            element: <OwnerLogin />
        },

        {
            path: "/owner/dashboard",
            element: <OwnerDashboard />
        },

        {
            path: "/employee",
            element: <EmployeeLogin />
        },

        {
            path: "/employee/dashboard",
            element: <EmployeeDashboard />
        }
    ]);

    return routeElements;
}