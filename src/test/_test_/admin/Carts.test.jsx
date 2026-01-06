// tests/Carts.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor,within } from "@testing-library/react";
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
        <Routes>
          <Route path="/" element={<Carts />} />
        </Routes>
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

    it("should display carts after loading", async () => {
      renderCarts();

      await waitFor(() => {
        expect(screen.getByText("#1")).toBeInTheDocument();
        expect(screen.getByText("#2")).toBeInTheDocument();
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
  describe("Statistics Display", () => {
    it("should display total carts count", async () => {
      renderCarts();

      await waitFor(() => {
        expect(screen.getByText("Total Carts")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
      });
    });

    it("should display active carts count", async () => {
      renderCarts();

      // 2 active carts (excluding empty cart)
      await waitFor(() => {
        expect(screen.getAllByText("Active Carts").length).toBeGreaterThan(0);
        expect(screen.getByText("2")).toBeInTheDocument();
      });
    });

    it("should calculate total revenue", async () => {
      renderCarts();

      // Total: 999.99 + 59.98 + 29.99 = 1089.96
      await waitFor(() => {
        expect(screen.getByText("Total Revenue")).toBeInTheDocument();
        expect(screen.getByText("$1089.96")).toBeInTheDocument();
      });
    });

    it("should calculate average cart value", async () => {
      renderCarts();

      // Average: 1089.96 / 2 active carts = 544.98
      await waitFor(() => {
        expect(screen.getByText("Avg Cart Value")).toBeInTheDocument();
        expect(screen.getByText("$544.98")).toBeInTheDocument();
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
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(
        /search by user id or cart id/i
      );
      await user.type(searchInput, "1");

      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
        expect(screen.queryByText("User 2")).not.toBeInTheDocument();
      });
    });

    it("should filter carts by status", async () => {
      const { user } = renderCarts();

      await waitFor(() => {
        expect(screen.getAllByText(/User/i).length).toBeGreaterThan(0);
      });

      const statusSelect = screen.getByDisplayValue(/all status/i);
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
        expect(screen.getByText("User 1")).toBeInTheDocument();
      });

      // Apply filter
      const searchInput = screen.getByPlaceholderText(
        /search by user id or cart id/i
      );
      await user.type(searchInput, "1");

      await waitFor(() => {
        expect(screen.getByText("User 1")).toBeInTheDocument();
        expect(screen.queryByText("User 2")).not.toBeInTheDocument();
      });

      // Clear filters
      const clearButton = screen.getByText(/clear filters/i);
      await user.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue("");
        expect(screen.getByText("User 1")).toBeInTheDocument();
        expect(screen.queryByText("User 2")).toBeInTheDocument();
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
        expect(screen.getByText("#1")).toBeInTheDocument();
      });

    const viewButton=screen.getAllByRole("button", { name:/view cart/i})[0];
    await user.click(viewButton);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/admin/carts/1");
      
     
    });
  });

    it("should open delete modal", async () => {
      const { user } = renderCarts();

      await waitFor(() => {
        expect(screen.getByText("#1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button",{name:/delete cart/i})[0];
      await user.click(deleteButtons);

         const dialog = await screen.findByRole("dialog");
        

        await waitFor(() => {
          expect(screen.getByRole("dialog")).toBeInTheDocument();
          expect( within(dialog).getByRole("button", { name: /delete/i })).toBeInTheDocument();
          expect(screen.getAllByText("Delete Cart").length).toBeGreaterThan(0);
        });
      
    });

 it("should delete cart successfully with delete modal", async () => {
      const { user } = renderCarts();

      await waitFor(() => {
        expect(screen.getByText("#1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByRole("button",{name:/delete cart/i})[0];
      await user.click(deleteButtons);

       

        await waitFor(() => {
          expect(screen.getByRole("dialog")).toBeInTheDocument();
          expect(screen.getAllByText("Delete Cart").length).toBeGreaterThan(0);
        });
          const dialog = await screen.findByRole("dialog");
         // confirm delete
          await user.click(
            within(dialog).getByRole("button", { name: /delete/i })
          );
        
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
        expect(screen.getByText("Shopping Carts")).toBeInTheDocument();
      });

      mockCartAPI.getAll.mockClear();
      mockProductAPI.getAll.mockClear();

      const refreshButton = screen.getByText(/^Refresh$/i);
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
        expect(screen.getByText(/no carts found/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe("Edge Cases", () => {
   

    it("should handle null/undefined API responses", async () => {
      mockCartAPI.getAll.mockResolvedValue({ data: null });
      mockProductAPI.getAll.mockResolvedValue({ data: undefined });

      renderCarts();

      await waitFor(() => {
        expect(screen.getByText("Shopping Carts")).toBeInTheDocument();
      });
    });
  });
});