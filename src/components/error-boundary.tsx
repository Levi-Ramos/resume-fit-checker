"use client";

import { Component, type ReactNode } from "react";

export class ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
