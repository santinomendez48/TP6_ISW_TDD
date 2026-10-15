import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "../src/App";

describe("Entorno de pruebas del frontend", () => {
  it("renderiza la aplicación con Testing Library", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "EcoHarmony Park" }),
    ).toBeInTheDocument();
  });
});
