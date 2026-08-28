import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Login page", () => {
  const mockLogin = jest.fn();

  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
    useAuth.mockReturnValue({ login: mockLogin });
  });

  const renderLogin = () =>
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

  it("renders email and password fields", () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });

  it("lets the user type into the email field", async () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    await userEvent.type(emailInput, "test@example.com");
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("calls login and navigates to dashboard on successful submit", async () => {
    mockLogin.mockResolvedValueOnce();
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "password123");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("test@example.com", "password123");
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows an error message when login fails", async () => {
    mockLogin.mockRejectedValueOnce({
      response: { data: { message: "Invalid email or password" } },
    });
    renderLogin();

    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText("••••••••"), "wrongpass");
    await userEvent.click(screen.getByRole("button", { name: /log in/i }));

    expect(await screen.findByText("Invalid email or password")).toBeInTheDocument();
  });
});