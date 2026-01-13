const LoadingSpinner = ({ size = 'md', message = 'Loading...' }) => {
    const sizes = {
        sm: 'w-6 h-6',
        md: 'w-10 h-10',
        lg: 'w-16 h-16',
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className={`${sizes[size]} relative`}>
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
            </div>
            {message && (
                <p className="mt-4 text-gray-500 dark:text-gray-400 text-sm animate-pulse">
                    {message}
                </p>
            )}
        </div>
    );
};

export default LoadingSpinner;
