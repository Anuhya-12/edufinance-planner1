import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import FinancePage from "../pages/FinancePage";
import { AuthProvider } from "../contexts/AuthContext";

describe("FinancePage", () => {
  it("shows loader initially", () => {
    const { container } = render(
      <AuthProvider>
        <FinancePage />
      </AuthProvider>
    );

    // check loader exists
    const loader = container.querySelector("svg");
    expect(loader).toBeInTheDocument();
  });
});