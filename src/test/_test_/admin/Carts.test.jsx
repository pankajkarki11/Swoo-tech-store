// tests/Carts.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Carts from "../../../pages/admin/Carts";

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

const mockCartAPI = {
  getAll: vi.fn(),
  delete: vi.fn(),
};

const mockProductAPI = {
  getAll: vi.fn(),
};

vi.mock("../../../services/AdminuseApi", () => ({
  default: vi.fn(() => ({
    cartAPI: mockCartAPI,
    productAPI: mockProductAPI,
  })),
}));

// ============================================================================
// MOCK DATA
// ============================================================================

const mockProducts = [
  { id: 1, title: "Laptop", price: 999.99, image: "laptop.jpg" },
  { id: 2, title: "Mouse", price: 29.99, image: "mouse.jpg" },
];

const mockCarts = [
  {
    id: 1,
    userId: 1,
    date: "2024-01-01",
    products: [
      { productId: 1, quantity: 1 }, // 999.99
      { productId: 2, quantity: 2 }, // 59.98
    ],
  },
  {
    id: 2,
    userId: 2,
    date: "2024-01-02",
    products: [{ productId: 2, quantity: 1 }], // 29.99
  },
  {
    id: 3,
    userId: 3,
    date: "2024-01-03",
    products: [], // Empty cart
  },
];

// ============================================================================
// HELPER
// ============================================================================

const renderCarts = () => {
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <Carts />
      </BrowserRouter>
    ),
  };
};

// ============================================================================
// TESTS
// ============================================================================

describe("Carts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockCartAPI.getAll.mockResolvedValue({ data: mockCarts });
    mockProductAPI.getAll.mockResolvedValue({ data: mockProducts });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Initial Render & Data Fetching
  // ==========================================================================
  describe("Initial Render & Data Fetching", () => {
    it("should show loading spinner while fetching", () => {
      mockCartAPI.getAll.mockImplementation(() => new Promise(() => {}));
      renderCarts();

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("should fetch carts and products on mount", async () => {
      renderCarts();

      expect(mockCartAPI.getAll).toHaveBeenCalledTimes(1);
      expect(mockProductAPI.getAll).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.getByText("Shopping Carts")).toBeInTheDocument();
      });
    });

    it("should display carts UI after loading", async () => {
      renderCarts();

      await waitFor(() => {
        const cart = screen.getByTestId("cart-table");
        expect(cart).toHaveTextContent("User 1");
        expect(cart).toHaveTextContent("User 2");
        expect(cart).toHaveTextContent("High Value");
        expect(cart).toHaveTextContent("Jan 1, 2024");

        expect(screen.getByTestId("cart-header")).toBeInTheDocument(); //header
        expect(screen.getByTestId("refresh-button")).toBeInTheDocument(); //refresh button
        expect(screen.getByTestId("create-button")).toBeInTheDocument(); //to reaTe a new cart
        expect(screen.getByTestId("cart-stats")).toBeInTheDocument(); //cart stats
        expect(screen.getByTestId("cart-filters")).toBeInTheDocument(); //filter section with search and status
        expect(screen.getByTestId("search-input")).toBeInTheDocument(); //filter search inout field
        expect(screen.getByTestId("status-select")).toBeInTheDocument(); //select the status for carts such as incative,active etc
        expect(screen.getByTestId("clear-filters-button")).toBeInTheDocument(); //clearing the filter
        expect(screen.getByTestId("cart-table")).toBeInTheDocument(); //shows the table of the cart with various cart no ,theyr user id etc
        expect(screen.getAllByTestId("delete-button").length).toBeGreaterThan(
          0
        ); //delete button in cart
        expect(screen.getAllByTestId("view-button").length).toBeGreaterThan(0);
      });
    });

    it("should handle API errors", async () => {
      mockCartAPI.getAll.mockRejectedValue(new Error("API Error"));
      renderCarts();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to load carts");
      });
    });
  });

  // ==========================================================================
  // Statistics Display
  // ==========================================================================
  describe("Statistics Display for Carts At Top", () => {
    it("should display total carts count", async () => {
      renderCarts();

      await waitFor(() => {
        const totalCartsElement = screen.getByTestId("total-carts-card");
        expect(totalCartsElement).toBeInTheDocument();
        expect(totalCartsElement).toHaveTextContent("3");
      });
    });

    it("should display active carts count", async () => {
      renderCarts();

      // 2 active carts (excluding empty cart)
      await waitFor(() => {
        const activeCartsElement = screen.getByTestId("active-carts-card");
        expect(activeCartsElement).toBeInTheDocument();
        expect(activeCartsElement).toHaveTextContent("2");
      });
    });

    it("should calculate total revenue", async () => {
      renderCarts();

      // Total: 999.99 + 59.98 + 29.99 = 1089.96
      await waitFor(() => {
        const totalRevenueElement = screen.getByTestId("total-revenue-card");
        expect(totalRevenueElement).toBeInTheDocument();
        expect(totalRevenueElement).toHaveTextContent("$1089.96");
      });
    });

    it("should calculate average cart value", async () => {
      renderCarts();

      // Average: 1089.96 / 2 active carts = 544.98
      await waitFor(() => {
        const averageCartValue = screen.getByTestId("avg-cart-value-card");
        expect(averageCartValue).toBeInTheDocument();
        expect(averageCartValue).toHaveTextContent("$544.98");
      });
    });
  });

  // ==========================================================================
  // Search & Filter
  // ==========================================================================
  describe("Search & Filter", () => {
    it("should filter carts by user ID", async () => {
      const { user } = renderCarts();

      await waitFor(() => {
        const cart = screen.getByTestId("cart-table");
        expect(cart).toBeInTheDocument();
        expect(cart).toHaveTextContent("User 1");
        expect(cart).toHaveTextContent("User 2");
        expect(cart).toHaveTextContent("High Value");
        expect(cart).toHaveTextContent("Jan 1, 2024");
      });
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "1");

      await waitFor(() => {
        const cart = screen.getByTestId("cart-table");
        expect(cart).toHaveTextContent("User 1");
        expect(cart).not.toHaveTextContent("User 2");
      });
    });

    it("should filter carts by status", async () => {
      const { user } = renderCarts();

      await waitFor(() => {
        const cart = screen.getByTestId("cart-table");
        expect(cart).toBeInTheDocument();
        expect(cart).toHaveTextContent("User 1");
        expect(cart).toHaveTextContent("User 2");
      });

      const statusSelect = screen.getByTestId("status-select");
      await user.selectOptions(statusSelect, "empty");

      await waitFor(() => {
        // Only empty cart should show
        const cartIds = screen.queryAllByText(/#\d+/);
        expect(cartIds.length).toBe(1);
      });
    });

    it("should clear filters", async () => {
      const { user } = renderCarts();

      await waitFor(() => {
        const cart = screen.getByTestId("cart-table");
        expect(cart).toBeInTheDocument();
        expect(cart).toHaveTextContent("User 1");
        expect(cart).toHaveTextContent("User 2");
      });

      // Apply filter
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "1");

      await waitFor(() => {
        const cart = screen.getByTestId("cart-table");
        expect(cart).toHaveTextContent("User 1");
        expect(cart).not.toHaveTextContent("User 2");
      });

      // Clear filters
      const clearButton = screen.getByTestId("clear-filters-button");
      await user.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue("");
        const cart = screen.getByTestId("cart-table");
        expect(cart).toHaveTextContent("User 1");
        expect(cart).toHaveTextContent("User 2");
      });
    });
  });

  // ==========================================================================
  // Cart Actions
  // ==========================================================================
  describe("Cart Actions", () => {
    it("should navigate to cart details on view", async () => {
      const { user } = renderCarts();

      await waitFor(() => {
        const cart = screen.getByTestId("cart-table");
        expect(cart).toHaveTextContent("User 1");
        expect(cart).toHaveTextContent("User 2");
      });

      const viewButton = screen.getAllByTestId("view-button")[0];
      await user.click(viewButton);
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/admin/carts/1");
      });
    });

    it("should open delete modal", async () => {
      const { user } = renderCarts();

      await waitFor(() => {
        const cart = screen.getByTestId("cart-table");
        expect(cart).toHaveTextContent("User 1");
        expect(cart).toHaveTextContent("User 2");
      });

      const deleteButtons = screen.getAllByTestId("delete-button")[0];
      await user.click(deleteButtons);

      const dialog = await screen.findByRole("dialog");

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(
          within(dialog).getByRole("button", { name: /delete/i })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Cancel" })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: "Delete Cart" })
        ).toBeInTheDocument();
      });
    });

    it("should delete cart successfully with delete modal", async () => {
      const { user } = renderCarts();

      await waitFor(() => {
        const cart = screen.getByTestId("cart-table");
        expect(cart).toHaveTextContent("User 1");
        expect(cart).toHaveTextContent("User 2");
      });

      const deleteButtons = screen.getAllByTestId("delete-button")[0];
      await user.click(deleteButtons);

      const dialog = await screen.findByRole("dialog");
      // confirm delete
      await user.click(within(dialog).getByRole("button", { name: /delete/i }));

      await waitFor(() => {
        expect(mockCartAPI.delete).toHaveBeenCalledWith(1);
        expect(mockToast.success).toHaveBeenCalledWith(
          "Cart deleted successfully"
        );
      });
    });
  });

  // ==========================================================================
  // Refresh
  // ==========================================================================
  describe("Refresh", () => {
    it("should refresh data when refresh button clicked", async () => {
      const { user } = renderCarts();

      await waitFor(() => {
        const cart = screen.getByTestId("cart-table");
        expect(cart).toHaveTextContent("User 1");
        expect(cart).toHaveTextContent("User 2");
      });

      mockCartAPI.getAll.mockClear();
      mockProductAPI.getAll.mockClear();

      const refreshButton = screen.getByTestId("refresh-button");
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockCartAPI.getAll).toHaveBeenCalledTimes(1);
        expect(mockProductAPI.getAll).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ==========================================================================
  // Empty State
  // ==========================================================================
  describe("Empty State", () => {
    it("should show empty state when no carts", async () => {
      mockCartAPI.getAll.mockResolvedValue({ data: [] });

      renderCarts();

      await waitFor(() => {
        const cart = screen.getByTestId("cart-table");
        expect(cart).not.toHaveTextContent("User 1");
        expect(cart).not.toHaveTextContent("User 2");
        expect(cart).toHaveTextContent(/No Carts Found/i);
      });
    });
  });
});
