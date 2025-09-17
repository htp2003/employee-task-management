import { useRoutes } from "react-router-dom";
import OwnerLogin from "./components/owner/OwnerLogin";
import OwnerDashboard from "./components/owner/OwnerDashboard";


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

    ]);

    return routeElements;
}