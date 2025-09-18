import { useRoutes } from "react-router-dom";
import OwnerLogin from "./components/owner/OwnerLogin";
import EmployeeLogin from "./components/employee/EmployeeLogin";
import OwnerDashboard from "./components/owner/OwnerDashboard";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import OwnerLayout from "./layouts/OwnerLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";
import OwnerMessages from "./components/owner/OwnerMessages";
import EmployeeMessages from "./components/employee/EmployeeMessages";
import OwnerTasks from "./components/owner/OwnerTasks";
import EmployeeSetup from "./components/employee/EmployeeSetup";
export default function useRouteElements() {
    const routeElements = useRoutes([
        //default
        {
            path: "/",
            element: <OwnerLogin />
        },
        {
            path: "/employee",
            element: <EmployeeLogin />
        },

        //owner routes 
        {
            path: "/owner/dashboard",
            element: (
                <OwnerLayout>
                    <OwnerDashboard />
                </OwnerLayout>
            )
        },
        {
            path: "/owner/tasks",
            element: (
                <OwnerLayout>
                    <OwnerTasks />
                </OwnerLayout>
            )
        },
        {
            path: "/owner/messages",
            element: (
                <OwnerLayout>
                    <OwnerMessages />
                </OwnerLayout>
            )
        },

        // employee routes 
        {
            path: "/employee/dashboard",
            element: (
                <EmployeeLayout>
                    <EmployeeDashboard />
                </EmployeeLayout>
            )
        },
        {
            path: "/employee/messages",
            element: (
                <EmployeeLayout>
                    <EmployeeMessages />
                </EmployeeLayout>
            )
        },
        {
            path: "/employee/setup",
            element: (

                <EmployeeSetup />

            )
        }

    ]);

    return routeElements;
}