// tests/Dashboard.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "../../../pages/admin/Dashboard";

// ============================================================================
// MOCKS
// ============================================================================

const mockNavigate = vi.fn();
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
};

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useOutletContext: () => ({ toast: mockToast }),
  };
});


// Mock AdminuseApi
const mockProductAPI = {
  getAll: vi.fn(),
};

const mockCartAPI = {
  getAll: vi.fn(),
};

const mockUserAPI = {
  getAll: vi.fn(),
};

vi.mock("../../../services/AdminuseApi", () => ({
  default: vi.fn(() => ({
    productAPI: mockProductAPI,
    cartAPI: mockCartAPI,
    userAPI: mockUserAPI,
  })),
}));

// Mock UI Components
const Card = ({ children, className }) => (
  <div data-testid="card" className={className}>
    {children}
  </div>
);
Card.Header = ({ children }) => <div data-testid="card-header">{children}</div>;
Card.Title = ({ children }) => <h3>{children}</h3>;
Card.Description = ({ children }) => <p>{children}</p>;
Card.Footer = ({ children }) => <div data-testid="card-footer">{children}</div>;

vi.mock("../../components_temp/ui/Card", () => ({
  default: Card,
}));

vi.mock("../../components_temp/ui/Button", () => ({
  default: ({ children, onClick, loading, disabled }) => (
    <button onClick={onClick} disabled={loading || disabled}>
      {loading ? "Loading..." : children}
    </button>
  ),
}));

vi.mock("../../components_temp/ui/Badge", () => ({
  default: ({ children }) => <span>{children}</span>,
}));

vi.mock("../../components_temp/ui/LoadingSpinner", () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const renderDashboard = () => {
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    ),
  };
};

// ============================================================================
// MOCK DATA
// ============================================================================

const mockProducts = [
  {
    id: 1,
    title: "Laptop Computer",
    price: 999.99,
    category: "electronics",
    image: "laptop.jpg",
    rating: { rate: 4.5, count: 120 },
  },
  {
    id: 2,
    title: "Wireless Mouse",
    price: 29.99,
    category: "electronics",
    image: "mouse.jpg",
    rating: { rate: 4.0, count: 85 },
  },
  {
    id: 3,
    title: "USB-C Cable",
    price: 12.99,
    category: "electronics",
    image: "cable.jpg",
    rating: { rate: 4.8, count: 200 },
  },
  {
    id: 4,
    title: "Desk Lamp",
    price: 45.50,
    category: "home",
    image: "lamp.jpg",
    rating: { rate: 4.3, count: 65 },
  },
  {
    id: 5,
    title: "Office Chair",
    price: 299.99,
    category: "furniture",
    image: "chair.jpg",
    rating: { rate: 4.7, count: 150 },
  },
];

const mockCarts = [
  {
    id: 1,
    userId: 1,
    products: [
      { productId: 1, quantity: 1 }, // 999.99
      { productId: 2, quantity: 2 }, // 59.98
    ],
  },
  {
    id: 2,
    userId: 2,
    products: [
      { productId: 3, quantity: 3 }, // 38.97
      { productId: 4, quantity: 1 }, // 45.50
    ],
  },
  {
    id: 3,
    userId: 3,
    products: [{ productId: 5, quantity: 1 }], // 299.99
  },
  {
    id: 4,
    userId: 4,
    products: [], // Empty cart
  },
];

const mockUsers = [
  { id: 1, email: "user1@example.com", username: "user1" },
  { id: 2, email: "user2@example.com", username: "user2" },
  { id: 3, email: "user3@example.com", username: "user3" },
  { id: 4, email: "user4@example.com", username: "user4" },
];


describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Default successful responses
    mockProductAPI.getAll.mockResolvedValue({ data: mockProducts });
    mockCartAPI.getAll.mockResolvedValue({ data: mockCarts });
    mockUserAPI.getAll.mockResolvedValue({ data: mockUsers });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Initial Render & Data Fetching
  // ==========================================================================
  describe("Initial Render & Data Fetching", () => {

    it("should show loading spinner while fetching data", () => {
      renderDashboard();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });


    it("should fetch all required data on mount", async () => {
      renderDashboard();

      await waitFor(() => {
       expect(screen.getByText("Dashboard")).toBeInTheDocument();
       expect(mockProductAPI.getAll).toHaveBeenCalledTimes(1);
        expect(mockCartAPI.getAll).toHaveBeenCalledTimes(1);
        expect(mockUserAPI.getAll).toHaveBeenCalledTimes(1);
      });
    });

    it("should display dashboard after data loads", async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      });
    });

    it("should handle API errors", async () => {
      const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
      mockProductAPI.getAll.mockRejectedValue(new Error("API Error"));

      renderDashboard();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to load dashboard data");
      });

      consoleError.mockRestore();
    });
  });

//   // ==========================================================================
//   // Statistics Display
//   // ==========================================================================
  describe("Statistics Display", () => {
    it("should calculate and display total revenue correctly", async () => {
      renderDashboard();

      // Total: 999.99 + 59.98 + 38.97 + 45.50 + 299.99 = 1444.43
      await waitFor(() => {
        expect(screen.getByText("$1444.43")).toBeInTheDocument();
      });
    });

    it("should display correct product count", async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Total Products")).toBeInTheDocument();
        expect(screen.getByText("5")).toBeInTheDocument();
      });
    });

    it("should count only non-empty carts as active", async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Active Carts")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument(); // 3 active, 1 empty
      });
    });

    it("should display total users", async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Total Users")).toBeInTheDocument();
       
      });
    });

    it("should calculate average cart value", async () => {
      renderDashboard();

      // 1444.43 / 3 = 481.48
      await waitFor(() => {
        expect(screen.getByText("Average Cart Value")).toBeInTheDocument();
        expect(screen.getByText("$481.48")).toBeInTheDocument();
      });
    });

  });

  // ==========================================================================
  // Recent Products
  // ==========================================================================
  describe("Recent Products", () => {
    it("should display recent products table", async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Recent Products")).toBeInTheDocument();
        expect(screen.getByText("Office Chair")).toBeInTheDocument();
        expect(screen.getByText("Wireless Mouse")).toBeInTheDocument();
      });
    });

    it("should navigate to product detail when row is clicked", async () => {
      const { user } = renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Office Chair")).toBeInTheDocument();
      });

      const productRow = screen.getByText("Office Chair").closest("tr");
      await user.click(productRow);

      expect(mockNavigate).toHaveBeenCalledWith("/admin/products/5");
    });

    it("should navigate to products page when View All is clicked", async () => {
      const { user } = renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("View All Products")).toBeInTheDocument();
      });

      await user.click(screen.getByText("View All Products"));

      expect(mockNavigate).toHaveBeenCalledWith("/admin/products");
    });

    it("should show empty state when no products", async () => {
      mockProductAPI.getAll.mockResolvedValue({ data: [] });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("No products yet")).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // User Actions
  // ==========================================================================
  describe("User Actions", () => {
    it("should refresh data when refresh button is clicked", async () => {
      const { user } = renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Refresh Data")).toBeInTheDocument();
      });

      mockProductAPI.getAll.mockClear();
      mockCartAPI.getAll.mockClear();
      mockUserAPI.getAll.mockClear();

      await user.click(screen.getByText("Refresh Data"));

      await waitFor(() => {
        expect(mockProductAPI.getAll).toHaveBeenCalledTimes(1);
        expect(mockCartAPI.getAll).toHaveBeenCalledTimes(1);
        expect(mockUserAPI.getAll).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe("Edge Cases", () => {
    it("should handle empty data gracefully", async () => {
      mockProductAPI.getAll.mockResolvedValue({ data: [] });
      mockCartAPI.getAll.mockResolvedValue({ data: [] });
      mockUserAPI.getAll.mockResolvedValue({ data: [] });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getAllByText("$0.00").length).toBeGreaterThan(1);
      });
    });

    it("should handle missing product prices in carts", async () => {
      const cartsWithMissingProduct = [
        {
          id: 1,
          userId: 1,
          products: [{ productId: 999, quantity: 5 }], // Non-existent product
        },
      ];

      mockCartAPI.getAll.mockResolvedValue({ data: cartsWithMissingProduct });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getAllByText("$0.00").length).toBeGreaterThan(0);
      });
    });

    it("should handle null/undefined API responses", async () => {
      mockProductAPI.getAll.mockResolvedValue({ data: null });
      mockCartAPI.getAll.mockResolvedValue({ data: undefined });
      mockUserAPI.getAll.mockResolvedValue({ data: null });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
      });
    });
  });
});