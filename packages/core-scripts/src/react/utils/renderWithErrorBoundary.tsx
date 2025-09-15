import { ReactNode } from "react";
// eslint-disable-next-line no-restricted-imports
import { render, Container } from "react-dom";
import { ErrorBoundary } from "@sentry/react";

const renderWithErrorBoundary = (
  element: ReactNode,
  container: Container | null,
  callback?: () => void,
): void => {
  render(<ErrorBoundary>{element}</ErrorBoundary>, container, callback);
};

export default renderWithErrorBoundary;
