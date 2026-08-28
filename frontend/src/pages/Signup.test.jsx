import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Signup from "./Signup";
import { useAuth } from "../context/AuthContext";

jest.mock("../context/AuthContext");

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

describe("Signup page", () => {
  const mockSignup = jest.fn();

  beforeEach(() => {
    mockSignup.mockReset();
    mockNavigate.mockReset();
    useAuth.mockReturnValue({ signup: mockSignup });
  });

  const renderSignup = () =>
    render(
      <MemoryRouter>
        <Signup />
      </MemoryRouter>
    );

  it("renders name, email, and password fields", () => {
    renderSignup();
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/at least 6 characters/i)).toBeInTheDocument();
  });

  it("calls signup and navigates to dashboard on successful submit", async () => {
    mockSignup.mockResolvedValueOnce();
    renderSignup();

    await userEvent.type(screen.getByPlaceholderText(/your name/i), "Maryam");
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), "test@example.com");
    await userEvent.type(screen.getByPlaceholderText(/at least 6 characters/i), "test1234");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(mockSignup).toHaveBeenCalledWith("Maryam", "test@example.com", "test1234");
  });

  it("shows an error message when signup fails", async () => {
    mockSignup.mockRejectedValueOnce({
      response: { data: { message: "An account with this email already exists" } },
    });
    renderSignup();

    await userEvent.type(screen.getByPlaceholderText(/your name/i), "Maryam");
    await userEvent.type(screen.getByPlaceholderText(/you@example.com/i), "dup@example.com");
    await userEvent.type(screen.getByPlaceholderText(/at least 6 characters/i), "test1234");
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(await screen.findByText(/already exists/i)).toBeInTheDocument();
  });
});