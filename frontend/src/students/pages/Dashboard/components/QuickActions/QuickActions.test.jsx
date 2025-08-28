import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import QuickActions from "./QuickActions";

// Wrapper component to provide router context
const renderWithRouter = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(ui, { wrapper: BrowserRouter });
};

describe("QuickActions Component", () => {
  test("renders all quick action items", () => {
    renderWithRouter(
      <QuickActions messageStats={{ unreadCount: 3 }} unreadMessageCount={3} />
    );

    // Check if all action items are rendered
    expect(screen.getByText("Find Tutors")).toBeInTheDocument();
    expect(screen.getByText("Book Session")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("Session History")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
    expect(screen.getByText("Edit Profile")).toBeInTheDocument();
  });

  test("displays badge for unread messages", () => {
    renderWithRouter(
      <QuickActions messageStats={{ unreadCount: 5 }} unreadMessageCount={5} />
    );

    // Check if the badge is displayed with the correct count
    const badge = screen.getByText("5");
    expect(badge).toBeInTheDocument();
  });

  test("does not display badge when no unread messages", () => {
    renderWithRouter(
      <QuickActions messageStats={{ unreadCount: 0 }} unreadMessageCount={0} />
    );

    // Check that no badge is displayed
    const messageTile = screen.getByText("Messages").closest("a");
    expect(messageTile.querySelector(".badge")).toBeNull();
  });
});
