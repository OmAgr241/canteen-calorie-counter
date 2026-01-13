import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                if (!formData.name.trim()) {
                    setError('Name is required');
                    setLoading(false);
                    return;
                }
                await register(formData.email, formData.password, formData.name);
            }
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <span className="text-6xl mb-4 block">🥗</span>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                        CalTrack
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Canteen Calorie Tracker
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                    {/* Toggle Tabs */}
                    <div className="flex gap-2 mb-8 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${isLogin
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${!isLogin
                                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-md'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email / College ID
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@college.edu"
                                required
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-gray-900 dark:text-white placeholder-gray-400"
                            />
                            {!isLogin && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Minimum 6 characters
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : isLogin ? 'Login' : 'Create Account'}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-2">
                            Demo Credentials:
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Admin: admin@canteen.com / admin123
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Or create a new account to try it out!
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-8">
                    College Canteen Calorie Tracker © 2026
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
