import { describe, it, expect, vi, beforeEach, afterEach} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Sidebar from "../../../components_temp/Sidebar";

// ============================================================================
// MOCKS
// ============================================================================

const mockNavigate = vi.fn();
const mockLogout = vi.fn();
const mockOnClose = vi.fn();

const mockAuthContext = {
  user: { name: "John Doe", username: "johndoe" },
  logout: mockLogout,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

    // 🔥 THIS IS THE FIX
    render(jsx);
  });

  fn.dismiss = vi.fn();
  fn.success = vi.fn();

  return fn;
});

vi.mock("react-hot-toast", () => ({
  default: mockToast,
}));
// Mock Button component
vi.mock("../../../components/layout/ui/Button", () => ({
  default: ({ children, onClick, variant, icon }) => (
    <button onClick={onClick} data-variant={variant}>
      {icon}
      {children}
    </button>
  ),
}));

// ============================================================================
// HELPER
// ============================================================================

const renderSidebar = (isOpen = true, onClose = mockOnClose) => {
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <Sidebar isOpen={isOpen} onClose={onClose} />
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
    mockNavigate.mockClear();
    mockLogout.mockClear();
    mockOnClose.mockClear();
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

    it("should display all navigation items", () => {
      renderSidebar(true);

      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Products")).toBeInTheDocument();
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
  describe("Navigation Links", () => {
    it("should have correct href for dashboard,products,carts,users", () => {
      renderSidebar(true);

      const dashboardLink = screen.getByText("Dashboard").closest("a");
      expect(dashboardLink).toHaveAttribute("href", "/admin/dashboard");

      const productsLink = screen.getByText("Products").closest("a");
      expect(productsLink).toHaveAttribute("href", "/admin/products");

       const cartsLink = screen.getByText("Carts").closest("a");
          expect(cartsLink).toHaveAttribute("href", "/admin/carts");

            const usersLink = screen.getByText("Users").closest("a");
                 expect(usersLink).toHaveAttribute("href", "/admin/users");
    });

  });

  // ==========================================================================
  // Collapse/Expand
  // ==========================================================================
  describe("Collapse/Expand", () => {

    it("should hide navigation labels when collapsed", async () => {
      const { user } = renderSidebar(true);

      const buttons = screen.getAllByRole("button");
      const collapseButton = buttons.find(btn => 
        btn.querySelector("svg") && btn.dataset.variant === "ghost"
      );

      if (collapseButton) {
        await user.click(collapseButton);

        await waitFor(() => {
          const dashboardText = screen.queryByText("Dashboard");
          expect(dashboardText).toBeInTheDocument();
             const productText = screen.queryByText("Products");
          expect(productText).not.toBeInTheDocument();
        });
      }
    });

    it("should show only user initial when collapsed", async () => {
      const { user } = renderSidebar(true);

      const buttons = screen.getAllByRole("button");
      const collapseButton = buttons.find(btn => 
        btn.querySelector("svg") && btn.dataset.variant === "ghost"
      );

      if (collapseButton) {
        await user.click(collapseButton);

        await waitFor(() => {
          expect(screen.getByText("J")).toBeInTheDocument();
        });
      }
    });
  });

  // ==========================================================================
  // Logout Functionality
  // ==========================================================================
  describe("Logout Functionality", () => {
    it("should show logout confirmation when logout clicked", async () => {
      const { user } = renderSidebar(true);

      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      expect(mockToast.custom).toHaveBeenCalled();
    });

    it("should render logout confirmation with correct buttons", async () => {
      const { user } = renderSidebar(true);

      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      const logoutToast = await screen.findByRole("dialog");
        await waitFor(()=>{
  expect(logoutToast).toBeInTheDocument();

  expect(screen.getByText("Cancel")).toBeInTheDocument();
  expect(screen.getByText("Yes, Logout")).toBeInTheDocument();
  expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
    });
    })

    it("should dismiss toast when cancel clicked", async () => {
      const { user } = renderSidebar(true);

      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("Cancel");
      await user.click(cancelButton);

      expect(mockToast.dismiss).toHaveBeenCalledWith("test-toast");
    });

    it("should logout and navigate when confirmed", async () => {
      const { user } = renderSidebar(true);

      const logoutButton = screen.getByText("Logout");
      await user.click(logoutButton);

      await waitFor(() => {
        expect(screen.getByText("Yes, Logout")).toBeInTheDocument();
      });

      const confirmButton = screen.getByText("Yes, Logout");
      await user.click(confirmButton);

      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/admin/login");
      expect(mockToast.dismiss).toHaveBeenCalledWith("test-toast");
      expect(mockToast.success).toHaveBeenCalledWith(
        "Logged out successfully!",
        expect.objectContaining({
          duration: 1000,
          position: "top-center",
        })
      );
    });
  });

  // ==========================================================================
  // User Display
  // ==========================================================================
  describe("User Display", () => {
    it("should display user name from user.name", () => {
      renderSidebar(true);

      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    it("should display username if name not available", () => {
      mockAuthContext.user = { username: "johndoe" };

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

      // Should render User icon instead of initial
      const avatars = document.querySelectorAll(".rounded-full");
      expect(avatars.length).toBeGreaterThan(0);
    });
  });

});