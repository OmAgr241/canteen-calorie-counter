import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { path: '/', label: 'Home', icon: '🏠' },
        { path: '/menu', label: 'Menu', icon: '🍔' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/history', label: 'History', icon: '📅' },
        { path: '/profile', label: 'Profile', icon: '👤' },
    ];

    if (user?.isAdmin) {
        navLinks.push({ path: '/admin', label: 'Admin', icon: '🛠' });
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="text-2xl">🥗</span>
                        <span className="font-bold text-xl bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                            CalTrack
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {user && navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive(link.path)
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <span className="mr-1">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? '☀️' : '🌙'}
                        </button>

                        {/* User Menu */}
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="hidden sm:block text-sm text-gray-600 dark:text-gray-400">
                                    {user.name}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-500 rounded-lg hover:from-red-600 hover:to-rose-600 transition-all shadow-md"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-md"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>

                {/* Mobile Navigation */}
                {user && (
                    <div className="md:hidden flex overflow-x-auto gap-1 pb-3 -mx-4 px-4 scrollbar-hide">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`flex-shrink-0 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive(link.path)
                                        ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                        : 'text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800'
                                    }`}
                            >
                                <span className="mr-1">{link.icon}</span>
                                {link.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
