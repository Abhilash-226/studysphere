import React, { Component } from "react";
import { Alert, Button } from "react-bootstrap";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <Alert variant="danger" className="m-3">
          <Alert.Heading>Something went wrong</Alert.Heading>
          <p>{this.state.error && this.state.error.toString()}</p>
          {this.props.resetOnError && (
            <div className="mt-3">
              <Button
                onClick={this.resetErrorBoundary}
                variant="outline-primary"
              >
                Try again
              </Button>
            </div>
          )}
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
