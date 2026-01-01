// Custom Envizio Logo - A stylized globe with weather/climate elements
export default function EnvizioLogo({ size = 32, className = '' }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Gradient Definitions */}
            <defs>
                <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="50%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
                <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#22c55e" />
                    <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="sunGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                </linearGradient>
            </defs>

            {/* Outer Ring - Represents atmosphere/environment */}
            <circle
                cx="24"
                cy="24"
                r="21"
                stroke="url(#globeGradient)"
                strokeWidth="2.5"
                fill="none"
                opacity="0.3"
            />

            {/* Main Globe Circle */}
            <circle
                cx="24"
                cy="24"
                r="16"
                stroke="url(#globeGradient)"
                strokeWidth="2"
                fill="none"
            />

            {/* Globe latitude lines */}
            <ellipse
                cx="24"
                cy="24"
                rx="16"
                ry="6"
                stroke="url(#globeGradient)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
            />

            {/* Globe longitude line */}
            <path
                d="M24 8 C28 14, 28 34, 24 40 C20 34, 20 14, 24 8"
                stroke="url(#globeGradient)"
                strokeWidth="1.5"
                fill="none"
                opacity="0.6"
            />

            {/* Stylized Leaf - Environment/Nature */}
            <path
                d="M20 28 Q24 20, 30 18 Q28 24, 24 28 Q22 30, 20 28"
                fill="url(#leafGradient)"
                opacity="0.9"
            />
            <path
                d="M23 25 Q25 22, 28 20"
                stroke="#fff"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
            />

            {/* Sun Element - Weather */}
            <circle
                cx="34"
                cy="14"
                r="5"
                fill="url(#sunGradient)"
            />
            {/* Sun rays */}
            <g stroke="url(#sunGradient)" strokeWidth="1.5" strokeLinecap="round">
                <line x1="34" y1="6" x2="34" y2="4" />
                <line x1="34" y1="24" x2="34" y2="22" />
                <line x1="40" y1="14" x2="42" y2="14" />
                <line x1="26" y1="14" x2="28" y2="14" />
                <line x1="38.2" y1="9.8" x2="39.6" y2="8.4" />
                <line x1="28.4" y1="19.6" x2="29.8" y2="18.2" />
                <line x1="38.2" y1="18.2" x2="39.6" y2="19.6" />
                <line x1="28.4" y1="8.4" x2="29.8" y2="9.8" />
            </g>

            {/* Data/Monitoring dots - Represents real-time data */}
            <circle cx="12" cy="20" r="2" fill="#06b6d4" opacity="0.8" />
            <circle cx="16" cy="32" r="1.5" fill="#3b82f6" opacity="0.7" />
            <circle cx="32" cy="30" r="1.5" fill="#8b5cf6" opacity="0.7" />
        </svg>
    );
}
