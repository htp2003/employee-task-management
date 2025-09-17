import { useRoutes } from "react-router-dom";
import OwnerLogin from "./components/owner/OwnerLogin";
import EmployeeLogin from "./components/employee/EmployeeLogin";
import OwnerDashboard from "./components/owner/OwnerDashboard";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import OwnerLayout from "./layouts/OwnerLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";

// Placeholder components for new pages
function OwnerTasks() {
    return (
        <div>
            <h2>Task Management</h2>
            <p>Assign and manage employee tasks</p>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
                <p style={{ color: '#666' }}>Task assignment feature coming soon...</p>
            </div>
        </div>
    );
}

function OwnerMessages() {
    return (
        <div>
            <h2>All Messages</h2>
            <p>Chat with employees</p>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
                <p style={{ color: '#666' }}>Real-time chat interface coming soon...</p>
            </div>
        </div>
    );
}

function EmployeeMessages() {
    return (
        <div>
            <h2>Message</h2>
            <p>Chat with Owner</p>
            <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px' }}>
                <p style={{ color: '#666' }}>Chat with owner interface coming soon...</p>
            </div>
        </div>
    );
}

export default function useRouteElements() {
    const routeElements = useRoutes([
        // Public routes (Login pages)
        {
            path: "/",
            element: <OwnerLogin />
        },
        {
            path: "/employee",
            element: <EmployeeLogin />
        },

        // Owner routes with OwnerLayout
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

        // Employee routes with EmployeeLayout  
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
        }
    ]);

    return routeElements;
}