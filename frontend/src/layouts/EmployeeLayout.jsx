import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/layout.css';

function EmployeeLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { key: 'profile', label: 'Manage Task', path: '/employee/dashboard' },
        { key: 'messages', label: 'Message', path: '/employee/messages' }
    ];

    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.includes('messages')) return 'messages';
        return 'profile';
    };

    const handleNavigation = (item) => {
        console.log('employee navigating to:', item.path);
        navigate(item.path);
    };

    const logout = () => {
        localStorage.removeItem('employeeData');
        console.log('employee logged out');
        navigate('/employee');
    };

    const getEmployeeName = () => {
        const empData = localStorage.getItem('employeeData');
        if (empData) {
            const employee = JSON.parse(empData);
            return employee.name || 'Employee';
        }
        return 'Employee';
    };

    return (
        <div className="layout-wrapper">
            {/* Sidebar */}
            <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <div className="logo-area">
                        <div className="logo-placeholder"></div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <div
                            key={item.key}
                            className={`nav-item ${getCurrentTab() === item.key ? 'active' : ''}`}
                            onClick={() => handleNavigation(item)}
                        >
                            <span className="nav-label">{item.label}</span>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="user-section">
                        <div className="user-avatar"></div>
                        <div className="user-info">
                            <span>{getEmployeeName()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-layout">
                {/* Top Header */}
                <div className="top-header">
                    <div className="header-left">
                        <button
                            className="sidebar-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            ☰
                        </button>
                        <h1 className="page-title">
                            {menuItems.find(item => item.key === getCurrentTab())?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="header-right">

                        <div className="user-menu">
                            <div className="user-avatar-small"></div>
                            <button onClick={logout} className="logout-btn">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="content-area">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default EmployeeLayout;