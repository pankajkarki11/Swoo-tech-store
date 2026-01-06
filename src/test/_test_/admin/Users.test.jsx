// tests/UsersPage.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UsersPage from "../../../pages/admin/Users";

// ============================================================================
// MOCKS
// ============================================================================

const mockNavigate = vi.fn();
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useOutletContext: () => ({ toast: mockToast }),
  };
});

const mockUserAPI = {
  getAll: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../../../services/AdminuseApi", () => ({
  default: vi.fn(() => ({
    userAPI: mockUserAPI,
  })),
}));

// ============================================================================
// MOCK DATA
// ============================================================================

const mockUsers = [
  {
    id: 1,
    username: "johndoe",
    email: "john@example.com",
    name: { firstname: "John", lastname: "Doe" },
    phone: "123-456-7890",
    address: { city: "New York", zipcode: "10001" },
  },
  {
    id: 2,
    username: "admin",
    email: "admin@example.com",
    name: { firstname: "Admin", lastname: "User" },
    phone: "098-765-4321",
    address: { city: "Los Angeles", zipcode: "90001" },
  },
  {
    id: 3,
    username: "janesmith",
    email: "jane@example.com",
    name: { firstname: "Jane", lastname: "Smith" },
    phone: "555-123-4567",
    address: { city: "Chicago", zipcode: "60601" },
  },
];

// ============================================================================
// HELPER
// ============================================================================

const renderUsersPage = () => {
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UsersPage />} />
        </Routes>
      </BrowserRouter>
    ),
  };
};

// ============================================================================
// TESTS
// ============================================================================

describe("UsersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockUserAPI.getAll.mockResolvedValue({ data: mockUsers });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Initial Render & Data Fetching
  // ==========================================================================
  describe("Initial Render & Data Fetching", () => {
    it("should show loading spinner while fetching", () => {
      mockUserAPI.getAll.mockImplementation(() => new Promise(() => {}));

      renderUsersPage();

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("should fetch users on mount", async () => {
      renderUsersPage();

      expect(mockUserAPI.getAll).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.getByText("Users")).toBeInTheDocument();
      });
    });

    it("should display users after loading", async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Admin User")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      });
    });

    it("should handle API errors", async () => {
      mockUserAPI.getAll.mockRejectedValue(new Error("API Error"));

      renderUsersPage();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to load users");
      });
    });

  });

  // ==========================================================================
  // Statistics Display
  // ==========================================================================
  describe("Statistics Display", () => {
    it("should display total users count", async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText("Total Users")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
      });
    });

    it("should display active users count", async () => {
      renderUsersPage();

      // Active users = total - 1
      await waitFor(() => {
        expect(screen.getByText("Active Users")).toBeInTheDocument();
        expect(screen.getAllByText("2").length).toBeGreaterThan(0);
      });
    });

    it("should display admin count", async () => {
      renderUsersPage();

      // 1 admin user (username contains "admin")
      await waitFor(() => {
        expect(screen.getByText("Admins")).toBeInTheDocument();
       
      });
    });
  });

  // ==========================================================================
  // Search & Filter
  // ==========================================================================
  describe("Search & Filter", () => {
    it("should filter users by firstname", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /search users by name, email, or username/i
      );
      await user.type(searchInput, "John");

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
      });
    });

    it("should filter users by email", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /search users by name, email, or username/i
      );
      await user.type(searchInput, "admin@example.com");

      await waitFor(() => {
        expect(screen.getByText("Admin User")).toBeInTheDocument();
        expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
      });
    });

    it("should filter users by role", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const roleSelect = screen.getByDisplayValue(/all roles/i);
      await user.selectOptions(roleSelect, "admin");

      await waitFor(() => {
        expect(screen.getByText("Admin User")).toBeInTheDocument();
        expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });
    });

    it("should clear filters", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Apply filter
      const searchInput = screen.getByPlaceholderText(
        /search users by name, email, or username/i
      );
      await user.type(searchInput, "John");

      // Clear filters
      const clearButton = screen.getByText(/clear filters/i);
      await user.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue("");
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("Jane Smith")).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // User Actions
  // ==========================================================================
  describe("User Actions", () => {
    it("should navigate to user details on view", async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      // Find link to user details
      const userLink = screen.getByText("John Doe").closest("tr").querySelector("a");
      
      if (userLink) {
        expect(userLink).toHaveAttribute("href", "/admin/users/1");
      }
    });


    it("should open delete modal", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
        expect(screen.getAllByText(/john/i).length).toBeGreaterThan(0);
      });

      const deleteButtons = screen.getAllByRole("button",{name:/delete user/i})[0];
      await user.click(deleteButtons);

         const dialog = await screen.findByRole("dialog");
        

        await waitFor(() => {
          expect(screen.getByRole("dialog")).toBeInTheDocument();
          expect( within(dialog).getByRole("button", { name: /delete user/i })).toBeInTheDocument();
          expect(screen.getAllByText(/Delete user/i).length).toBeGreaterThan(0);
        });
      
    });

 it("should delete user successfully with delete modal", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
        expect(screen.getAllByText(/john/i).length).toBeGreaterThan(0);
      });

      const deleteButtons = screen.getAllByRole("button",{name:/delete user/i})[0];
      await user.click(deleteButtons);

       

        await waitFor(() => {
          expect(screen.getByRole("dialog")).toBeInTheDocument();
          expect(screen.getAllByText(/delete user/i).length).toBeGreaterThan(0);
        });
          const dialog = await screen.findByRole("dialog");
         // confirm delete
          await user.click(
            within(dialog).getByRole("button", { name: /delete user/i })
          );
        
          await waitFor(() => {
            expect(mockUserAPI.delete).toHaveBeenCalledWith(1);
            expect(mockToast.success).toHaveBeenCalledWith(
              "User deleted successfully"
            );
          });
      
    });
  });

  // ==========================================================================
  // Refresh
  // ==========================================================================
  describe("Refresh", () => {
    it("should refresh data when refresh button clicked", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText("Users")).toBeInTheDocument();
      });

      mockUserAPI.getAll.mockClear();

      const refreshButton = screen.getByText(/^Refresh$/i);
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockUserAPI.getAll).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ==========================================================================
  // Empty State
  // ==========================================================================
  describe("Empty State", () => {
    it("should show empty state when no users match filter", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /search users by name, email, or username/i
      );
      await user.type(searchInput, "nonexistent");

      await waitFor(() => {
        expect(screen.getByText(/no users found/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe("Edge Cases", () => {
    it("should handle users with missing name fields", async () => {
      const usersWithMissingNames = [
        {
          id: 1,
          username: "testuser",
          email: "test@example.com",
          name: null,
          phone: "123-456-7890",
          address: { city: "Test", zipcode: "12345" },
        },
      ];

      mockUserAPI.getAll.mockResolvedValue({ data: usersWithMissingNames });

      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText("Users")).toBeInTheDocument();
      });
    });

    it("should handle null/undefined API response", async () => {
      mockUserAPI.getAll.mockResolvedValue({ data: null });

      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByText("Users")).toBeInTheDocument();
      });
    });
  });
});