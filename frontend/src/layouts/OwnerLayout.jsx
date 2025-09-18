import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../styles/layout.css';

function OwnerLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const menuItems = [
        { key: 'employees', label: 'Manage Employee', path: '/owner/dashboard' },
        { key: 'tasks', label: 'Manage Task', path: '/owner/tasks' },
        { key: 'messages', label: 'Messages', path: '/owner/messages' }
    ];

    const getCurrentTab = () => {
        const path = location.pathname;
        if (path.includes('messages')) return 'messages';
        if (path.includes('tasks')) return 'tasks';
        return 'employees';
    };

    const handleNavigation = (item) => {
        console.log('navigating to:', item.path);
        navigate(item.path);
    };

    const logout = () => {
        localStorage.removeItem('ownerPhone');
        console.log('owner logged out');
        navigate('/');
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
                            <span>Owner</span>
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

export default OwnerLayout;