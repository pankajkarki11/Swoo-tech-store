// tests/UsersPage.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
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
        <UsersPage />
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
    });

    it("should display users UI after loading", async () => {
      renderUsersPage();

      await waitFor(() => {
        expect(screen.getByTestId("users-header")).toBeInTheDocument();

        expect(screen.getByTestId("refresh-button")).toBeInTheDocument();
        expect(screen.getByTestId("users-stats")).toBeInTheDocument();

        expect(screen.getByTestId("total-users-card")).toBeInTheDocument();
        expect(screen.getByTestId("active-users-card")).toBeInTheDocument();
        expect(screen.getByTestId("admins-card")).toBeInTheDocument();
        expect(screen.getByTestId("customers-card")).toBeInTheDocument();
        expect(screen.getByTestId("filters-card")).toBeInTheDocument();
        expect(screen.getByTestId("search-input")).toBeInTheDocument();
        expect(screen.getByTestId("role-select")).toBeInTheDocument();
        expect(screen.getByTestId("clear-filters-button")).toBeInTheDocument();
        expect(screen.getByTestId("users-table")).toBeInTheDocument();
        expect(screen.getAllByTestId("view-button")[0]).toBeInTheDocument();//there are multiple view button because we have multiple users and each ahve their own view button,delete button and edit button.
        expect(screen.getAllByTestId("delete-button")[0]).toBeInTheDocument();

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

        const totalUsersCard = screen.getByTestId("total-users-card");
        expect(totalUsersCard).toBeInTheDocument();
        expect(totalUsersCard).toHaveTextContent("3");
        expect(totalUsersCard).toHaveTextContent("Total Users");
      });
    });

    it("should display active users count", async () => {
      renderUsersPage();

      // Active users = total - 1
      await waitFor(() => {

        const activeUsersCard = screen.getByTestId("active-users-card");
        expect(activeUsersCard).toBeInTheDocument();
        expect(activeUsersCard).toHaveTextContent("2");
        expect(activeUsersCard).toHaveTextContent("Active Users");
      });
    });

    it("should display admin count", async () => {
      renderUsersPage();

      // 1 admin user (username contains "admin")
      await waitFor(() => {

        const adminsCard = screen.getByTestId("admins-card");
        expect(adminsCard).toBeInTheDocument();
        expect(adminsCard).toHaveTextContent("Admins");
      });
    });
      it("should display Customer count", async () => {
      renderUsersPage();

      // 1 admin user (username contains "admin")
      await waitFor(() => {

      const customersCard = screen.getByTestId("customers-card");
      expect(customersCard).toBeInTheDocument();
      expect(customersCard).toHaveTextContent("2");
      expect(customersCard).toHaveTextContent("Customers");
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

        const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
      });

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "John");

      await waitFor(() => {
         const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
        expect(userTable).not.toHaveTextContent("Jane Smith");
      });
    });

    it("should filter users by email", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
        const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
      });

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "admin@example.com");

      await waitFor(() => {
        const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).not.toHaveTextContent("John Doe");
        expect(userTable).toHaveTextContent("Admin User");
      });
    });

    it("should filter users by role", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
          const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
      });

      const roleSelect = screen.getByTestId("role-select");
      await user.selectOptions(roleSelect, "admin");

      await waitFor(() => {

         const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
        expect(userTable).toHaveTextContent("Admin User");
        expect(userTable).not.toHaveTextContent("Jane Smith");
      });
    });

    it("should clear filters", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
            const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
      });

      // Apply filter
       const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "John");

      await waitFor(() => {
         const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
        expect(userTable).not.toHaveTextContent("Jane Smith");
      });

      // Clear filters
      const clearButton = screen.getByTestId("clear-filters-button");
      await user.click(clearButton);

      await waitFor(() => {
       const userTable = screen.getByTestId("users-table");
        expect(userTable).toHaveTextContent("John Doe");
        expect(userTable).toHaveTextContent("Jane Smith");
      });
    });
  });

  // ==========================================================================
  // User Actions
  // ==========================================================================
  describe("User Actions", () => {
    it("should navigate to user details on Clicking view Button", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
         const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
      });

      // Find link to user details
      const userLink = screen.getAllByTestId("view-button")[0];
      await user.click(userLink);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/admin/users/1");
      });
    });

    it("should open delete modal", async () => {
      const { user } = renderUsersPage();

      await waitFor(() => {
      const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
      });

      const deleteButtons = screen.getAllByTestId("delete-button")[0];
      await user.click(deleteButtons);

      const dialog = await screen.findByRole("dialog");

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(
          within(dialog).getByRole("button", { name: /delete user/i })
        ).toBeInTheDocument();
        expect(
          within(dialog).getByRole("button", { name: /cancel/i })
        ).toBeInTheDocument();
       
      });
    });

    it("should delete user successfully with delete modal", async () => {
      const { user } = renderUsersPage();

       await waitFor(() => {
      const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
      });

      const deleteButtons = screen.getAllByTestId("delete-button")[0];
      await user.click(deleteButtons);

      const dialog = await screen.findByRole("dialog");

        await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(
          within(dialog).getByRole("button", { name: /delete user/i })
        ).toBeInTheDocument();
        expect(
          within(dialog).getByRole("button", { name: /cancel/i })
        ).toBeInTheDocument();
       
      });

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
        const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
      });

      mockUserAPI.getAll.mockClear();

      const refreshButton = screen.getByTestId("refresh-button");
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
        const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("John Doe");
      });

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "Hari");

      await waitFor(() => {
          const userTable = screen.getByTestId("users-table");
          expect(userTable).toHaveTextContent(/no users found/i);
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
         const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("testuser");
      });
    });

    it("should handle null/undefined API response", async () => {
      mockUserAPI.getAll.mockResolvedValue({ data: null });

      renderUsersPage();

      await waitFor(() => {
          const userTable = screen.getByTestId("users-table");
        expect(userTable).toBeInTheDocument();
        expect(userTable).toHaveTextContent("No users foundNo users have been created yet");//as there is no response from the api so it shows no users founf ,no users have been creayted yet
     
      });
    });
  });
});
