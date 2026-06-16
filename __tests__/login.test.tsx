import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import AdminLoginPage from "../src/app/login/page";

// Mock API client
vi.mock("@/lib/api", () => ({
  api: {
    post: vi.fn(() => Promise.resolve({ data: { user: { role: "admin" }, token: "mock-token" } })),
  },
}));

// Mock js-cookie
vi.mock("js-cookie", () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

// Mock Sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  ShieldAlert: () => <svg data-testid="shield-icon" />,
  Eye: () => <svg data-testid="eye-icon" />,
  EyeOff: () => <svg data-testid="eyeoff-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
  Lock: () => <svg data-testid="lock-icon" />,
}));

describe("Admin Login Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    });
  });

  it("should render credentials forms fields", () => {
    render(<AdminLoginPage />);

    expect(screen.getByPlaceholderText("admin@prepniti.io")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Verify credentials/ })).toBeInTheDocument();
  });

  it("should support email and password input updates", () => {
    render(<AdminLoginPage />);

    const emailInput = screen.getByPlaceholderText("admin@prepniti.io");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    fireEvent.change(emailInput, { target: { value: "my-admin@prepniti.io" } });
    fireEvent.change(passwordInput, { target: { value: "SecretPass!1" } });

    expect(emailInput).toHaveValue("my-admin@prepniti.io");
    expect(passwordInput).toHaveValue("SecretPass!1");
  });

  it("should toggle password visibility", () => {
    render(<AdminLoginPage />);

    const toggleButton = screen.getByLabelText("Toggle password visibility");
    const passwordInput = screen.getByPlaceholderText("••••••••");

    // Initially password type is password
    expect(passwordInput).toHaveAttribute("type", "password");

    // Click toggle button -> text type
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "text");

    // Click toggle button again -> password type
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
