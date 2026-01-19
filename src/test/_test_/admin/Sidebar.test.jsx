import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Sidebar from "../../../components_temp/Sidebar";


const mockAuthContext = {
  user: {},
};

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}));

const mockToast = vi.hoisted(() => {
  const fn = vi.fn();

  fn.custom = vi.fn((renderFn) => {
    const jsx = renderFn({
      id: "test-toast",
      visible: true,
    });
    render(jsx);
  });
  fn.dismiss = vi.fn();
  return fn;
});

vi.mock("react-hot-toast", () => ({
  default: mockToast,
}));

// ============================================================================
// HELPER
// ============================================================================

const renderSidebar = (isOpen) => {
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>
    ),
  };
};

// ============================================================================
// TESTS
// ============================================================================

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
   
    mockAuthContext.user = { name: "John Doe", username: "johndoe" };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
  // ==========================================================================
  // Initial Render
  // ==========================================================================
  describe("Initial Render", () => {
    it("should display sidebar when open", () => {
      renderSidebar(true);

      expect(screen.getByText("SwooTechMart")).toBeInTheDocument();
    });

    it("should display all navigation items & UI components", () => {
      renderSidebar(true);

      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("sidebar-header")).toBeInTheDocument();
      expect(screen.getByTestId("collapse-button")).toBeInTheDocument();
      expect(screen.getByTestId("close-button-mobile")).toBeInTheDocument();
      expect(screen.getAllByTestId("sidebar-link").length).toBe(4); //as there are 4 links in sidebarsuch as dashboard,products,carts,users.
      expect(screen.getByTestId("logout-button")).toBeInTheDocument();
      expect(screen.getByTestId("sidebar-user-info")).toBeInTheDocument();
      // expect(screen.getByTestId("logout-confirmation-dialog")).toBeInTheDocument();//as it is not loaded initially but when logout button is clicked

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument(); //names of the links
      expect(screen.getByText("Carts")).toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("J")).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Navigation Links
  // ==========================================================================
  describe("Navigation Links in the sidebars", () => {
    it("should have correct href for dashboard,products,carts,users", () => {
      renderSidebar(true);

      const dashboardLink = screen.getAllByTestId("sidebar-link")[0];
      expect(dashboardLink).toHaveTextContent("Dashboard");
      expect(dashboardLink).toHaveAttribute("href", "/admin/dashboard");

      const productsLink = screen.getAllByTestId("sidebar-link")[1];
      expect(productsLink).toHaveTextContent("Products");
      expect(productsLink).toHaveAttribute("href", "/admin/products");

      const cartsLink = screen.getAllByTestId("sidebar-link")[2];
      expect(cartsLink).toHaveTextContent("Carts");
      expect(cartsLink).toHaveAttribute("href", "/admin/carts");

      const usersLink = screen.getAllByTestId("sidebar-link")[3];
      expect(usersLink).toHaveTextContent("Users");
      expect(usersLink).toHaveAttribute("href", "/admin/users");
    });
  });

  // ==========================================================================
  // Collapse/Expand
  // ==========================================================================
  describe("Collapse/Expand", () => {
    it("should hide navigation labels when collapsed", async () => {
      const { user } = renderSidebar(true);

      const collapseButton = screen.getByTestId("collapse-button");
      await user.click(collapseButton);

      await waitFor(() => {
        expect(screen.getByTestId("sidebar")).toBeInTheDocument();
        const sidebarHeader = screen.getByTestId("sidebar-header");
        expect(sidebarHeader).toBeInTheDocument();
        expect(sidebarHeader).not.toHaveTextContent("SwooTechMart"); //as when collapsed swootechmart is not visible.
        const sidebarLinks = screen.getAllByTestId("sidebar-link");
        expect(sidebarLinks.length).toBe(4);
        expect(sidebarLinks[0]).not.toHaveTextContent("Dashboard");
        expect(sidebarLinks[1]).not.toHaveTextContent("Products");
        expect(sidebarLinks[2]).not.toHaveTextContent("Carts");
        expect(sidebarLinks[3]).not.toHaveTextContent("Users"); //thses are the names of the links and they are not visible, only the icons are visible
      });
    });
  });
  // ==========================================================================
  // Logout Functionality
  // ==========================================================================
  describe("Logout Functionality", () => {
    it("should show logout confirmation dialog when logout clicked", async () => {
      const { user } = renderSidebar(true);

      const logoutButton = screen.getByTestId("logout-button");
      await user.click(logoutButton);
        expect(mockToast.custom).toHaveBeenCalled();

      await waitFor(() => {
        expect(
          screen.getByTestId("logout-confirmation-dialog")
        ).toBeInTheDocument();
        expect(screen.getByTestId("logout-cancel-button")).toBeInTheDocument();
        expect(screen.getByTestId("logout-confirm-button")).toBeInTheDocument();
        expect(
          screen.getByTestId("logout-confirmation-dialog")
        ).toHaveTextContent("Confirm Logout");
      });
    });

 it("should dismiss toast when cancel clicked", async () => {
      const { user } = renderSidebar(true);

  const logoutButton = screen.getByTestId("logout-button");
      await user.click(logoutButton);
        expect(mockToast.custom).toHaveBeenCalled();

        await waitFor(() => {
        expect(
          screen.getByTestId("logout-confirmation-dialog")
        ).toBeInTheDocument();
        expect(screen.getByTestId("logout-cancel-button")).toBeInTheDocument();
        expect(screen.getByTestId("logout-confirm-button")).toBeInTheDocument();
        expect(
          screen.getByTestId("logout-confirmation-dialog")
        ).toHaveTextContent("Confirm Logout");
      });
      const cancelButton =screen.getByTestId("logout-cancel-button")
      await user.click(cancelButton);
      expect(mockToast.dismiss).toHaveBeenCalledWith("test-toast");
    });
  });

  // ==========================================================================
  // User Display
  // ===============
  describe("User Display", () => {
    it("should show only user initial when collapsed", async () => {
      const { user } = renderSidebar(true);

      const collapseButton = screen.getByTestId("collapse-button");
      await user.click(collapseButton);

      await waitFor(() => {
        const sidebarUser = screen.getByTestId("sidebar-user-info");
        expect(sidebarUser).toBeInTheDocument();
        expect(sidebarUser).toHaveTextContent("J");
        expect(sidebarUser).not.toHaveTextContent("John Doe");
      });
    });

    it("should display user name from user.name", () => {
      renderSidebar(true);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should display username if name not available", () => {
      mockAuthContext.user = { username: "johndoe", name: null };
      renderSidebar(true);

      expect(screen.getByText("johndoe")).toBeInTheDocument();
    });

    it("should display default text if no user info", () => {
      mockAuthContext.user = {};
      renderSidebar(true);

      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });

    it("should display user initial from name", () => {
      mockAuthContext.user = { name: "John Doe" };

      renderSidebar(true);

      expect(screen.getByText("J")).toBeInTheDocument();
    });

    it("should display user initial from username", () => {
      mockAuthContext.user = { username: "admin" };

      renderSidebar(true);

      expect(screen.getByText("A")).toBeInTheDocument();
    });

    it("should display fallback icon if no initials", () => {
      mockAuthContext.user = {};
      renderSidebar(true);

      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
      // Should render User icon instead of initial
    });
  });
});
