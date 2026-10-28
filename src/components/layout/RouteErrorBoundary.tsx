import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from 'primereact/button';

interface RouteErrorBoundaryProps {
    children: ReactNode;
}

interface RouteErrorBoundaryState {
    hasError: boolean;
}

// Most likely cause: a deploy replaced the page chunks this tab still references.
export default class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
    state: RouteErrorBoundaryState = { hasError: false };

    static getDerivedStateFromError(): RouteErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error(error, info.componentStack);
    }

    render() {
        if (!this.state.hasError) {
            return this.props.children;
        }

        return (
            <div className="flex flex-column align-items-center justify-content-center gap-3 py-8">
                <div className="flex align-items-center">
                    <i className="pi pi-exclamation-circle mr-2 text-red-500"></i>
                    <h2 className="text-red-500 m-0">Não foi possível carregar a página.</h2>
                </div>
                <Button label="Recarregar" icon="pi pi-refresh" onClick={() => window.location.reload()} />
            </div>
        );
    }
}
