import { render, screen } from "@testing-library/react";
import Collaborators from "./Collaborators";

jest.mock("@/components/componentes/SideBar", () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar" />,
}));

jest.mock("@/components/componentes/Header", () => ({
  __esModule: true,
  default: () => <div data-testid="header" />,
}));

describe("Tela de Colaboradores", () => {
  it("deve renderizar o título da página", () => {
    render(<Collaborators />);

    expect(
      screen.getByText("Gerenciar Colaboradores")
    ).toBeInTheDocument();
  });
});
