import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "You're Offline – SafeIn",
    robots: { index: false, follow: false },
};

export default function OfflinePage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f0f4fb] p-4">
            <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-xl shadow-[#3882a5]/10">
                {/* Gradient band */}
                <div className="-mx-10 -mt-10 h-1.5 rounded-t-2xl bg-gradient-to-r from-[#074463] via-[#3882a5] to-[#98c7dd] mb-8" />

                {/* Logo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/aynzo-logo.png"
                    alt="SafeIn"
                    className="mx-auto mb-5 h-14 w-14 object-contain"
                />

                {/* Wifi-off icon */}
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#3882a5]/10">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#3882a5"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <line x1="2" y1="2" x2="22" y2="22" />
                        <path d="M8.5 16.5a5 5 0 0 1 7-7" />
                        <path d="M10.9 4.5A9.77 9.77 0 0 1 12 4.5a9.5 9.5 0 0 1 9.5 9.5 9.77 9.77 0 0 1-.5 3" />
                        <path d="M16.5 16.5A9.5 9.5 0 0 1 2.5 14" />
                        <circle cx="12" cy="20" r="1" fill="#3882a5" stroke="none" />
                    </svg>
                </div>

                <h1 className="mb-2 text-xl font-bold text-[#074463]">You're Offline</h1>
                <p className="mb-6 text-sm leading-relaxed text-gray-500">
                    It looks like you've lost your internet connection. Please check your network and try again.
                </p>

                <a
                    href="/"
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[#3882a5] px-8 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2d6a87]"
                >
                    Try Again
                </a>
            </div>
        </div>
    );
}
