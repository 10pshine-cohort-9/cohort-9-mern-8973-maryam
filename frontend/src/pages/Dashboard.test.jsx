import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

jest.mock("../api/axios");
jest.mock("../context/AuthContext");

describe("Dashboard page", () => {
  beforeEach(() => {
    useAuth.mockReturnValue({ user: { name: "Maryam" }, logout: jest.fn() });
  });

  const renderDashboard = () =>
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    );

  it("shows a loading state, then displays notes", async () => {
    api.get.mockResolvedValueOnce({
      data: {
        data: {
          notes: [
            { _id: "1", title: "My first note", content: "hello", noteType: "note", color: "purple", updatedAt: new Date().toISOString() },
          ],
        },
      },
    });

    renderDashboard();
    expect(screen.getByText(/loading your notes/i)).toBeInTheDocument();
    expect(await screen.findByText("My first note")).toBeInTheDocument();
  });

  it("shows an empty state when there are no notes", async () => {
    api.get.mockResolvedValueOnce({ data: { data: { notes: [] } } });
    renderDashboard();
    expect(await screen.findByText(/your page is waiting/i)).toBeInTheDocument();
  });

  it("shows an error state when notes fail to load", async () => {
    api.get.mockRejectedValueOnce(new Error("Network error"));
    renderDashboard();
    expect(await screen.findByText(/could not load your notes/i)).toBeInTheDocument();
  });
});