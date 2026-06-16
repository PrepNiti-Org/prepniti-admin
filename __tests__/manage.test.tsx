import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ManageMocksPage from "../src/app/manage/page";

// Mock API client
vi.mock("../../lib/api", () => ({
  api: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    put: vi.fn(() => Promise.resolve({})),
    delete: vi.fn(() => Promise.resolve({})),
  },
}));

// Mock Lucide icons
vi.mock("lucide-react", () => ({
  Loader2: () => <svg data-testid="loader-icon" />,
}));

// Mock sub-components
vi.mock("./_components/PaperCard", () => ({
  PaperCard: ({ paper }: any) => <div data-testid="paper-card">{paper.filename}</div>,
}));
vi.mock("./_components/RenameModal", () => ({
  RenameModal: () => <div data-testid="rename-modal" />,
}));
vi.mock("./_components/DeleteModal", () => ({
  DeleteModal: () => <div data-testid="delete-modal" />,
}));

describe("Manage Mocks Page (Admin)", () => {
  it("should show loader during fetch and empty placeholder if no papers", async () => {
    render(<ManageMocksPage />);

    // Loader displays first
    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();

    // Eventually empty repository text displays
    await waitFor(() => {
      expect(screen.getByText(/No published test papers found/)).toBeInTheDocument();
    });
  });
});
