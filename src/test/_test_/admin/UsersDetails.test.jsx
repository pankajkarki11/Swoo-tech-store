// tests/UserDetails.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserDetails from "../../../pages/admin/UserDetails";

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
    useParams: () => ({ id: "1" }),
    useNavigate: () => mockNavigate,
    useOutletContext: () => ({ toast: mockToast }),
  };
});

const mockUserAPI = {
  getById: vi.fn(),
};

const mockCartAPI = {
  getUserCarts: vi.fn(),
};

const mockProductAPI = {
  getById: vi.fn(),
};

vi.mock("../../../services/AdminuseApi", () => ({
  default: vi.fn(() => ({
    userAPI: mockUserAPI,
    cartAPI: mockCartAPI,
    productAPI: mockProductAPI,
  })),
}));
// ============================================================================
// MOCK DATA
// ============================================================================

const mockUser = {
  id: 1,
  username: "johndoe",
  email: "john@example.com",
  name: { firstname: "John", lastname: "Doe" },
  phone: "+1 (555) 123-4567",
  address: {
    street: "123 Main St",
    city: "New York",
    zipcode: "10001",
  },
};

const mockCarts = [
  {
    id: 1,
    userId: 1,
    date: "2024-01-15",
    products: [
      { productId: 1, quantity: 2 },
      { productId: 2, quantity: 1 },
    ],
  },
  {
    id: 2,
    userId: 1,
    date: "2024-01-20",
    products: [{ productId: 3, quantity: 1 }],
  },
];

const mockProduct1 = {
  id: 1,
  title: "Laptop",
  price: 999.99,
};

const mockProduct2 = {
  id: 2,
  title: "Mouse",
  price: 29.99,
};

const mockProduct3 = {
  id: 3,
  title: "Keyboard",
  price: 79.99,
};

// ============================================================================
// HELPER
// ============================================================================

const renderUserDetails = () => {
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UserDetails />} />
        </Routes>
      </BrowserRouter>
    ),
  };
};

// ============================================================================
// TESTS
// ============================================================================

describe("UserDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    mockUserAPI.getById.mockResolvedValue({ data: mockUser });
    mockCartAPI.getUserCarts.mockResolvedValue({ data: mockCarts });
    mockProductAPI.getById
      .mockResolvedValueOnce({ data: mockProduct1 })
      .mockResolvedValueOnce({ data: mockProduct2 })
      .mockResolvedValueOnce({ data: mockProduct3 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Initial Render & Data Fetching
  // ==========================================================================
  describe("Initial Render & Data Fetching", () => {
    it("should show loading spinner while fetching", () => {
      mockUserAPI.getById.mockImplementation(() => new Promise(() => {}));

      renderUserDetails();

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("should fetch user and cart data on mount", async () => {
      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("User Details")).toBeInTheDocument();
         expect(mockUserAPI.getById).toHaveBeenCalledWith("1");
      expect(mockCartAPI.getUserCarts).toHaveBeenCalledWith("1");
      });
    });

    it("should display user information after loading", async () => {
      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("@johndoe")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
      });
    });

    it("should handle user fetch error", async () => {
      mockUserAPI.getById.mockRejectedValue(new Error("User Error"));

      renderUserDetails();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to load user details");
      });
    });
  });

  // ==========================================================================
  // User Information Display
  // ==========================================================================
  describe("User Information Display", () => {
    it("should display user details", async () => {
      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
         expect(screen.getByText("JD")).toBeInTheDocument();
             expect(screen.getByText("@johndoe")).toBeInTheDocument();
             expect(screen.getByText("john@example.com")).toBeInTheDocument();
             expect(screen.getByText("+1 (555) 123-4567")).toBeInTheDocument();
              expect(screen.getByText(/123 Main St, New York/i)).toBeInTheDocument();
                      expect(screen.getByText("User ID")).toBeInTheDocument();
                      expect(screen.getByText("Active")).toBeInTheDocument();
      });
    });

  });

  // ==========================================================================
  // User Statistics
  // ==========================================================================
  describe("User Statistics", () => {
    it("should display total carts count", async () => {
      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("Total Carts")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
      });
    });

    it("should calculate total spent correctly", async () => {
      renderUserDetails();

      // Cart 1: (999.99 * 2) + (29.99 * 1) = 2029.97
      // Cart 2: (79.99 * 1) = 79.99
      // Total: 2109.96
      await waitFor(() => {
        expect(screen.getByText("Total Spent")).toBeInTheDocument();
        expect(screen.getByText("$2109.96")).toBeInTheDocument();
      });
    });
    });

  // ==========================================================================
  // Recent Carts Display
  // ==========================================================================
  describe("Recent Carts Display", () => {
    it("should display recent carts section", async () => {
      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("Recent Carts")).toBeInTheDocument();
        expect(screen.getByText("User's recent shopping carts")).toBeInTheDocument();
      });
    });

    it("should display cart items count", async () => {
      renderUserDetails();

      await waitFor(() => {
        // Cart 1 has 3 items, Cart 2 has 1 item
        const itemCounts = screen.getAllByText("3");
        expect(itemCounts.length).toBeGreaterThan(0);
      });
    });

    it("should display cart total values", async () => {
      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("$2029.97")).toBeInTheDocument();
        expect(screen.getByText("$79.99")).toBeInTheDocument();
      });
    });

    it("should display cart status badges", async () => {
      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("High Value")).toBeInTheDocument();
        expect(screen.getByText("Low Value")).toBeInTheDocument();
      });
    });

    it("should navigate to cart details on view click", async () => {
      renderUserDetails();

      await waitFor(() => {
        expect(screen.getAllByText("#1").length).toBeGreaterThan(0);
      });

      const viewButton = screen.getAllByText("View")[0];
      expect(viewButton.closest("a")).toHaveAttribute("href", "/admin/carts/1");
    });

    it("should show empty state when user has no carts", async () => {
      mockCartAPI.getUserCarts.mockResolvedValue({ data: [] });

      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("No carts found")).toBeInTheDocument();
        expect(screen.getByText(/hasn't created any shopping carts yet/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Navigation
  // ==========================================================================
  describe("Navigation", () => {
    it("should navigate back to Users page", async () => {
        const { user } = renderUserDetails();
  
        await waitFor(() => {
          expect(screen.getByText("Back")).toBeInTheDocument();
        });
  
        const backButton = screen.getByText("Back");
        await user.click(backButton);
  
        expect(mockNavigate).toHaveBeenCalledWith("/admin/users");
      });
  });

  // ==========================================================================
  // Actions
  // ==========================================================================
  describe("Actions", () => {
    it("should display edit and send email button", async () => {
      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("Edit User")).toBeInTheDocument();
        expect(screen.getByText("Send Email")).toBeInTheDocument();
      });
    });


    it("should navigate to send email on button click", async () => {
      const { user } = renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("Send Email")).toBeInTheDocument();
      });

      const sendEmailButton = screen.getAllByText("Send Email")[0];
      await user.click(sendEmailButton);

      expect(mockNavigate).toHaveBeenCalledWith("/sentemail");
    });

    it("should display view orders button", async () => {
      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("View Orders")).toBeInTheDocument();
      });
    });

    it("should navigate to view orders on button click", async () => {
      const { user } = renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("View Orders")).toBeInTheDocument();
      });

      const viewOrdersButton = screen.getByText("View Orders");
      await user.click(viewOrdersButton);

      expect(mockNavigate).toHaveBeenCalledWith("/vieworder");
    });

  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe("Edge Cases", () => {
    it("should handle user with missing name fields", async () => {
      const userWithoutName = { ...mockUser, name: null };
      mockUserAPI.getById.mockResolvedValue({ data: userWithoutName });

      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("User Details")).toBeInTheDocument();
      });
    });

    it("should handle user with missing address", async () => {
      const userWithoutAddress = { ...mockUser, address: null };
      mockUserAPI.getById.mockResolvedValue({ data: userWithoutAddress });

      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("User Details")).toBeInTheDocument();
      });
    });

    it("should handle carts with missing products", async () => {
      const cartsWithMissingProducts = [
        {
          id: 1,
          userId: 1,
          date: "2024-01-01",
          products: [{ productId: 999, quantity: 1 }],
        },
      ];

      mockCartAPI.getUserCarts.mockResolvedValue({ data: cartsWithMissingProducts });
      mockProductAPI.getById.mockRejectedValue(new Error("Product not found"));

      renderUserDetails();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
      });
    });
  });
});