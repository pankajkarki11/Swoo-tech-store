// tests/AdminLogin.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import AdminLogin from "../../../pages/admin/AdminLogin";

// ============================================================================
// MOCKS
// ============================================================================

const mockNavigate = vi.fn();
const mockLogin = vi.fn();

const mockAuthContext = {
  login: mockLogin,
  isAuthenticated: false,
  isAdmin: false,
  loading: false,
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => mockAuthContext,
}));


// ============================================================================
// HELPER
// ============================================================================

const renderAdminLogin = (authOverrides = {}) => {
  Object.assign(mockAuthContext, authOverrides);
  
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <AdminLogin />
      </BrowserRouter>
    ),
  };
};

// ============================================================================
// TESTS
// ============================================================================

describe("AdminLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockLogin.mockClear();
    
    // Reset auth context to defaults
    Object.assign(mockAuthContext, {
      login: mockLogin,
      isAuthenticated: false,
      isAdmin: false,
      loading: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Initial Render
  // ==========================================================================
  describe("Initial Render", () => {
    it("should display admin login page", () => {
      renderAdminLogin();

      expect(screen.getByText("Admin Login")).toBeInTheDocument();
      expect(screen.getByText("Restricted Access")).toBeInTheDocument();
    });

    it("should display username and password fields", () => {
      renderAdminLogin();

      expect(screen.getByLabelText("Username")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("should display login button", () => {
      renderAdminLogin();

      expect(screen.getByText("Login to Admin Panel")).toBeInTheDocument();
    });

    it("should display demo login button", () => {
      renderAdminLogin();

      expect(screen.getByText("Try admin")).toBeInTheDocument();
      expect(screen.getByText("johnd")).toBeInTheDocument();
    });

    it("should display link to client login", () => {
      renderAdminLogin();

      expect(screen.getByText(/Don't have admin access/i)).toBeInTheDocument();
      expect(screen.getByText("Try Client Login")).toBeInTheDocument();
    });

    it("should show loading spinner when auth is loading", () => {
      renderAdminLogin({ loading: true });

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // Admin Hint Feature
  // ==========================================================================
  describe("Admin Hint Feature", () => {
    it("should show admin hint for admin patterns", async () => {
      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      await user.type(usernameInput, "johnd");

      await waitFor(() => {
        expect(screen.getByText(/Have admin privilage/i)).toBeInTheDocument();
      });
    });

    it("should not show hint for non-admin patterns", async () => {
      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      await user.type(usernameInput, "user123");

      await waitFor(() => {
        expect(screen.queryByText(/Have admin privilage/i)).not.toBeInTheDocument();
      });
    });

    it("should clear hint when username is cleared", async () => {
      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      await user.type(usernameInput, "johnd");

      await waitFor(() => {
        expect(screen.getByText(/Have admin privilage/i)).toBeInTheDocument();
      });

      await user.clear(usernameInput);

      await waitFor(() => {
        expect(screen.queryByText(/Have admin privilage/i)).not.toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Login Flow
  // ==========================================================================
  describe("Login Flow", () => {
    it("should call login function with credentials", async () => {
      mockLogin.mockResolvedValue({ success: true, isAdmin: true });

      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      const passwordInput = screen.getByLabelText("Password");

      await user.type(usernameInput, "admin");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText("Login to Admin Panel");
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: "admin",
          password: "password123",
        });
      });
    });

    it("should navigate to dashboard on successful admin login", async () => {
      mockLogin.mockResolvedValue({ success: true, isAdmin: true });

      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      const passwordInput = screen.getByLabelText("Password");

      await user.type(usernameInput, "admin");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText("Login to Admin Panel");
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard", { replace: true });
      });
    });

    it("should show error when user is not admin", async () => {
      mockLogin.mockResolvedValue({ success: true, isAdmin: false });

      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      const passwordInput = screen.getByLabelText("Password");

      await user.type(usernameInput, "user123");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText("Login to Admin Panel");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/does'nt have admin access/i)).toBeInTheDocument();
      });
    });

    it("should show error on login failure", async () => {
      mockLogin.mockResolvedValue({ 
        success: false, 
        error: "Invalid credentials" 
      });

      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      const passwordInput = screen.getByLabelText("Password");

      await user.type(usernameInput, "admin");
      await user.type(passwordInput, "wrongpassword");

      const loginButton = screen.getByText("Login to Admin Panel");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });
    });


    it("should disable form during login", async () => {
      mockLogin.mockImplementation(() => new Promise(() => {}));

      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      const passwordInput = screen.getByLabelText("Password");

      await user.type(usernameInput, "admin");
      await user.type(passwordInput, "password123");

      const loginButton = screen.getByText("Login to Admin Panel");
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText("Verifying...")).toBeInTheDocument();
        expect(usernameInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
      });
    });
  });

  // ==========================================================================
  // Demo Login
  // ==========================================================================
  describe("Demo Login", () => {
    it("should populate credentials for john demo", async () => {
      const { user } = renderAdminLogin();

      const demoButton = screen.getByText("johnd");
      await user.click(demoButton);

      await waitFor(() => {
        const usernameInput = screen.getByLabelText("Username");
        const passwordInput = screen.getByLabelText("Password");

        expect(usernameInput).toHaveValue("johnd");
        expect(passwordInput).toHaveValue("m38rmF$");
      });
    });
  });

  // ==========================================================================
  // Redirect Logic
  // ==========================================================================
  describe("Redirect Logic", () => {
    it("should redirect authenticated admin to dashboard", () => {
      renderAdminLogin({
        isAuthenticated: true,
        isAdmin: true,
        loading: false,
      });

      expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard", { replace: true });
    });

    it("should not redirect non-admin users", () => {
      renderAdminLogin({
        isAuthenticated: true,
        isAdmin: false,
        loading: false,
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe("Edge Cases", () => {
 

    it("should handle case-insensitive admin pattern matching", async () => {
      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      await user.type(usernameInput, "  JOHND");

      await waitFor(() => {
        expect(screen.getByText(/Have admin privilage/i)).toBeInTheDocument();
      });
    });

    it("should handle special characters in password", async () => {
      mockLogin.mockResolvedValue({ success: true, isAdmin: true });

      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      const passwordInput = screen.getByLabelText("Password");

      await user.type(usernameInput, "johnd");
      await user.type(passwordInput, "p@$$w0rd!#");

      const loginButton = screen.getByText("Login to Admin Panel");
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: "johnd",
          password: "p@$$w0rd!#",
        });
      });
    });
  });
});