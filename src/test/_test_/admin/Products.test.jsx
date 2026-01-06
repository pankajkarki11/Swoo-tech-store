// tests/Products.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "../../../pages/admin/Products";

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

const mockProductAPI = {
  getAll: vi.fn(),
  getCategories: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

vi.mock("../../../services/AdminuseApi", () => ({
  default: vi.fn(() => ({
    productAPI: mockProductAPI,
  })),
}));


// ============================================================================
// MOCK DATA
// ============================================================================

const mockProducts = [
  {
    id: 1,
    title: "Laptop",
    price: 999.99,
    category: "electronics",
    image: "laptop.jpg",
    description: "High-performance laptop",
    rating: { rate: 4.5, count: 100 },
  },
  {
    id: 2,
    title: "T-Shirt",
    price: 19.99,
    category: "clothing",
    image: "shirt.jpg",
    description: "Cotton t-shirt",
    rating: { rate: 4.0, count: 50 },
  },
];

const mockCategories = ["electronics", "clothing", "books"];

// ============================================================================
// HELPER
// ============================================================================

const renderProducts = () => {
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Products />} />
        </Routes>
      </BrowserRouter>
    ),
  };
};

// ============================================================================
// TESTS
// ============================================================================

describe("Products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockProductAPI.getAll.mockResolvedValue({ data: mockProducts });
    mockProductAPI.getCategories.mockResolvedValue({ data: mockCategories });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Initial Render & Data Fetching
  // ==========================================================================
  describe("Initial Render & Data Fetching", () => {
    it("should show loading spinner while fetching", () => {
      mockProductAPI.getAll.mockImplementation(() => new Promise(() => {}));

      renderProducts();

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("should fetch products and categories on mount", async () => {
      renderProducts();

      await waitFor(() => {
         expect(screen.getByText("Products")).toBeInTheDocument();
        expect(mockProductAPI.getAll).toHaveBeenCalledTimes(1);
      expect(mockProductAPI.getCategories).toHaveBeenCalledTimes(1);
       
      });
    });

    it("should display products after loading", async () => {
      renderProducts();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("T-Shirt")).toBeInTheDocument();
      });
    });

    it("should handle API errors", async () => {
      mockProductAPI.getAll.mockRejectedValue(new Error("API Error"));

      renderProducts();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to load data");
      });
    });
  });

  // ==========================================================================
  // Statistics Display
  // ==========================================================================
  describe("Statistics Display", () => {
    it("should display total products count", async () => {
      renderProducts();

      await waitFor(() => {
        expect(screen.getByText("Total Products")).toBeInTheDocument();
        expect(screen.getByText("2")).toBeInTheDocument();
      });
    });

    it("should display categories count", async () => {
      renderProducts();

      await waitFor(() => {
        expect(screen.getByText("Categories")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
      });
    });

    it("should calculate average price", async () => {
      renderProducts();

      // Average: (999.99 + 19.99) / 2 = 509.99
      await waitFor(() => {
        expect(screen.getByText("Avg. Price")).toBeInTheDocument();
        expect(screen.getByText("$509.99")).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Search & Filter
  // ==========================================================================
  describe("Search & Filter", () => {
    it("should filter products by search term", async () => {
      const { user } = renderProducts();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search products/i);
      await user.type(searchInput, "Laptop");

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.queryByText("T-Shirt")).not.toBeInTheDocument();
      });
    });

    it("should filter products by category", async () => {
      const { user } = renderProducts();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const categorySelect = screen.getByDisplayValue(/all categories/i);
      await user.selectOptions(categorySelect, "clothing");

      await waitFor(() => {
        expect(screen.getByText("T-Shirt")).toBeInTheDocument();
        expect(screen.queryByText("Laptop")).not.toBeInTheDocument();
      });
    });

    it("should clear filters", async () => {
      const { user } = renderProducts();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      // Apply search filter
      const searchInput = screen.getByPlaceholderText(/search products/i);
      await user.type(searchInput, "Laptop");

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.queryByText("T-Shirt")).not.toBeInTheDocument();
      });

      // Clear filters
      const clearButton = screen.getByText(/clear filters/i);
      await user.click(clearButton);

      await waitFor(() => {
        expect(searchInput).toHaveValue("");
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("T-Shirt")).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Product Actions
  // ==========================================================================
  describe("Product Actions", () => {
    it("should open add product modal", async () => {
      const { user } = renderProducts();

      await waitFor(() => {
        expect(screen.getByText("Products")).toBeInTheDocument();
      });

      const addButton = screen.getAllByRole("button", { name:/add product/i})[0];
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name:/Create Product/i})).toBeInTheDocument();
      });
    });


    it("should open edit modal with product data", async () => {
      const { user } = renderProducts();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const editbutton= screen.getAllByRole("button", { name:/edit/i})[0];
      await user.click(editbutton);

        await waitFor(() => {
            expect(screen.getByText("Edit Product")).toBeInTheDocument();
            expect(screen.getByRole("button", { name:/Update Product/i})).toBeInTheDocument();
            expect(screen.getByRole("button", { name:/cancel/i})).toBeInTheDocument();

        });
      
    });
      it("should open delete modal with product data", async () => {
      const { user } = renderProducts();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const deletebutton= screen.getAllByRole("button", { name:/delete-product/i})[0];
      await user.click(deletebutton);

        await waitFor(() => {
            expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
            expect(screen.getAllByRole("button", { name:/delete/i}).length).toBeGreaterThan(0);
            expect(screen.getByRole("button", { name:/cancel/i})).toBeInTheDocument();

        });
      
    });



   it("should delete product successfully", async () => {
  mockProductAPI.delete.mockResolvedValue({ success: true });
  const { user } = renderProducts();

  await screen.findByText("Laptop");

  // open delete modal
  await user.click(
    screen.getAllByRole("button", { name: /delete-product/i })[0]
  );

  const dialog = await screen.findByRole("dialog");

  // confirm delete
  await user.click(
    within(dialog).getByRole("button", { name: /delete/i })
  );

  await waitFor(() => {
    expect(mockProductAPI.delete).toHaveBeenCalledWith(1);
    expect(mockToast.success).toHaveBeenCalledWith(
      "Product deleted successfully"
    );
  });
});

  });

  // ==========================================================================
  // Refresh
  // ==========================================================================
  describe("Refresh", () => {
    it("should refresh data when refresh button clicked", async () => {
      const { user } = renderProducts();

      await waitFor(() => {
        expect(screen.getByText("Products")).toBeInTheDocument();
      });

      mockProductAPI.getAll.mockClear();
      mockProductAPI.getCategories.mockClear();

      const refreshButton = screen.getByText(/^Refresh$/i);
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockProductAPI.getAll).toHaveBeenCalledTimes(1);
        expect(mockProductAPI.getCategories).toHaveBeenCalledTimes(1);
      });
    });
  });

  // ==========================================================================
  // Empty State
  // ==========================================================================
  describe("Empty State", () => {
    it("should show empty state when no products", async () => {
      mockProductAPI.getAll.mockResolvedValue({ data: [] });

      renderProducts();

      await waitFor(() => {
        expect(screen.getByText(/no products found/i)).toBeInTheDocument();
      });
    });

    it("should show empty state with filtered results", async () => {
      const { user } = renderProducts();

      await waitFor(() => {
        expect(screen.getByText("Laptop")).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText(/search products/i);
      await user.type(searchInput, "nonexistent");

      await waitFor(() => {
        expect(screen.getByText(/no products found/i)).toBeInTheDocument();
      });
    });
  });
});