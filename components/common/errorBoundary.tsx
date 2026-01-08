"use client";

import React from "react";
import { StatusPage } from "@/components/common/statusPage";

interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                const FallbackComponent = this.props.fallback;
                return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
            }

            return (
                <StatusPage
                    type="error"
                    title="Something went wrong"
                    message="An unexpected error occurred. Please try refreshing the page."
                    description={this.state.error?.message}
                    primaryAction={{
                        label: "Refresh Page",
                        onClick: () => window.location.reload(),
                    }}
                    secondaryAction={{
                        label: "Try Again",
                        onClick: this.resetError,
                    }}
                    showHomeButton={true}
                />
            );
        }

        return this.props.children;
    }
}
