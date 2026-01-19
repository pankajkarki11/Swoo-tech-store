import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import HeaderAdmin from "../../../components_temp/HeaderAdmin";

const mockAuthContext = {
  user: {},
  isAdmin:true
};

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}));
// ============================================================================
// HELPER
// ============================================================================

const renderAdminHeader = () => {
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <HeaderAdmin />
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
    it("Should display Welcome message", () => {
      renderAdminHeader();
      expect(screen.getByText(/welcome back, john/i)).toBeInTheDocument();
    });

    it("Should Render all Components", () => {
      renderAdminHeader();
      expect(screen.getByTestId("mobile-menu-button")).toBeInTheDocument();
      expect(screen.getByTestId("dark-mode-toggle")).toBeInTheDocument();
      expect(screen.getByTestId("notification-button")).toBeInTheDocument();
      expect(screen.getByTestId("profile-button")).toBeInTheDocument();
    });
  });

  describe("Checking Each components", () => {
    it("Should show Notification Dropdown when clicking notification button", async () => {
      const { user } = renderAdminHeader();
      const notificationButton = screen.getByTestId("notification-button");
      await user.click(notificationButton);
      await waitFor(() => {
        expect(screen.getByTestId("notification-dropdown")).toBeInTheDocument();
          expect(screen.getByTestId("view-all-notifications-button")).toBeInTheDocument();
      });
    });
    it("Should hide Notification Dropdown when again clicking notification button", async () => {
      const { user } = renderAdminHeader();
      const notificationButton = screen.getByTestId("notification-button");
      await user.click(notificationButton);
      await waitFor(() => {
        expect(screen.getByTestId("notification-dropdown")).toBeInTheDocument();
          expect(screen.getByTestId("view-all-notifications-button")).toBeInTheDocument();
      });
      await user.click(notificationButton);
      await waitFor(() => {
        expect(screen.queryByTestId("notification-dropdown")).not.toBeInTheDocument();
      });
    });

   it("should show profile information",()=>{
    renderAdminHeader();
      mockAuthContext.user = { name: "John Doe" };

         const profileButton=screen.getByTestId("profile-button");
         expect(profileButton).toBeInTheDocument();
         expect(profileButton).toHaveTextContent("J");//initial letter
         expect(profileButton).toHaveTextContent("John Doe");//full name 
         expect(profileButton).not.toHaveTextContent("johndoe");
         expect(profileButton).toHaveTextContent("Admin");//shows admin sign
   })
  });
});
