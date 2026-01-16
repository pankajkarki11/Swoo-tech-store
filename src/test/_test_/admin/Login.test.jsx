// tests/AdminLogin.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import AdminLogin from "../../../pages/admin/AdminLogin";

// ============================================================================
// MOCKS
// ============================================================================


const mockLogin = vi.fn();

const mockAuthContext = {
  login: mockLogin,
  isAdmin: false,
  loading: false,
};

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

describe("AdminLogin Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockClear();
     vi.spyOn(console, "error").mockImplementation(() => {});
    
    
    // Reset auth context to defaults
    Object.assign(mockAuthContext, {
      login: mockLogin,
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
  describe("Initial Rendering", () => {
    it("should display Login Details:", () => {
      renderAdminLogin();

        expect(screen.getByText("Admin Login")).toBeInTheDocument();
        expect(screen.getByText("Restricted Access")).toBeInTheDocument();
        expect(screen.getByLabelText("Username")).toBeInTheDocument();
       expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByText("Login to Admin Panel")).toBeInTheDocument();
        expect(screen.getByText("Try admin")).toBeInTheDocument();
       expect(screen.getByText("johnd")).toBeInTheDocument();

      expect(screen.getByText(/Don't have admin access/i)).toBeInTheDocument();
      expect(screen.getByText("Try Client Login")).toBeInTheDocument();
    });

    it("should show loading spinner when auth is loading", () => {
      renderAdminLogin({ loading: true });

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });
  });

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
     it("should handle case-insensitive admin pattern matching", async () => {
      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      await user.type(usernameInput, "  JOHND");

      await waitFor(() => {
        expect(screen.getByText(/Have admin privilage/i)).toBeInTheDocument();
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
    it("Can types uername and password in the fields", async () => {
      mockLogin.mockResolvedValue({ success: true, isAdmin: true });

      const { user } = renderAdminLogin();

      const usernameInput = screen.getByLabelText("Username");
      const passwordInput = screen.getByLabelText("Password");

      await user.type(usernameInput, "admin");
      await user.type(passwordInput, "password123");


      await waitFor(() => {
        expect(usernameInput).toHaveValue("admin");
        expect(passwordInput).toHaveValue("password123");
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

  describe("Demo Login", () => {
    it("should populate credentials for john demo", async () => {
      const { user } = renderAdminLogin();

      const demoButton = screen.getByText("johnd");
      await user.click(demoButton);

      await waitFor(() => {


        //it shows that when we click on demo button the username and password should be populated to the input fields as we dont wanna pass the userna,e and passwor din the test case.
      const inputName = screen.getByLabelText("Username");
      expect(inputName.value.length).toBeGreaterThan(0);

      const inputPassword =screen.getByLabelText("Password");
      expect(inputPassword.value.length).toBeGreaterThan(0);

      });
    });
  });
});