// tests/ProductDetails.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach,fireEvent } from "vitest";
import { render, screen, waitFor,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductDetails from "../../../pages/admin/ProductDetails";

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

const mockProductAPI = {
  getById: vi.fn(),
  getByCategory: vi.fn(),
  getCategories: vi.fn(),
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

const mockProduct = {
  id: 1,
  title: "Gaming Laptop",
  price: 999.99,
  category: "electronics",
  description: "High-performance gaming laptop with RTX graphics",
  image: "laptop.jpg",
  rating: { rate: 4.5, count: 120 },
};

const mockRelatedProducts = [
  {
    id: 2,
    title: "Gaming Mouse",
    price: 49.99,
    category: "electronics",
    image: "mouse.jpg",
  },
  {
    id: 3,
    title: "Gaming Keyboard",
    price: 79.99,
    category: "electronics",
    image: "keyboard.jpg",
  },
];

const mockCategories = ["electronics", "clothing", "books"];

// ============================================================================
// HELPER
// ============================================================================

const renderProductDetails = () => {
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProductDetails />} />
        </Routes>
      </BrowserRouter>
    ),
  };
};

// ============================================================================
// TESTS
// ============================================================================

describe("ProductDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockProductAPI.getById.mockResolvedValue({ data: mockProduct });
    mockProductAPI.getByCategory.mockResolvedValue({ data: mockRelatedProducts });
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
      mockProductAPI.getById.mockImplementation(() => new Promise(() => {}));

      renderProductDetails();

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    it("should fetch product details on mount", async () => {
      renderProductDetails();

      expect(mockProductAPI.getById).toHaveBeenCalledWith("1");
      expect(mockProductAPI.getCategories).toHaveBeenCalled();

      await waitFor(() => {
        expect(screen.getByText("Product Details")).toBeInTheDocument();
      });
    });

    it("should display product information", async () => {
      renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText("Gaming Laptop")).toBeInTheDocument();
        expect(screen.getByText("$999.99")).toBeInTheDocument();
        expect(screen.getAllByText("electronics").length).toBeGreaterThan(0);
        expect(screen.getByText(/high-performance gaming laptop/i)).toBeInTheDocument();
      });
    });

    it("should fetch and display related products", async () => {
      renderProductDetails();

      await waitFor(() => {
        expect(mockProductAPI.getByCategory).toHaveBeenCalledWith("electronics");
        expect(screen.getByText("Gaming Mouse")).toBeInTheDocument();
        expect(screen.getByText("Gaming Keyboard")).toBeInTheDocument();
      });
    });

    it("should handle API errors", async () => {
      mockProductAPI.getById.mockRejectedValue(new Error("API Error"));

      renderProductDetails();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to load product details");
      });
    });
  });

  // ==========================================================================
  // Product Display
  // ==========================================================================
  describe("Product Display", () => {
    it("should display product details", async () => {
      renderProductDetails();

      await waitFor(() => {
        expect(screen.getAllByText("4.5").length).toBeGreaterThan(0);
        expect(screen.getAllByText(/(120 reviews)/i).length).toBeGreaterThan(0);
            expect(screen.getByText("Total Reviews")).toBeInTheDocument();
        expect(screen.getByText("120")).toBeInTheDocument();
        expect(screen.getByText("Avg. Rating")).toBeInTheDocument();
        expect(screen.getByText("Product ID")).toBeInTheDocument();
        expect(screen.getByText("#1")).toBeInTheDocument();
      });
    });

   

    it("should handle product with no rating", async () => {
      const productWithoutRating = { ...mockProduct, rating: null };
      mockProductAPI.getById.mockResolvedValue({ data: productWithoutRating });

      renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText("N/A")).toBeInTheDocument();
      });
    });

    it("should display product image", async () => {
      renderProductDetails();

      await waitFor(() => {
        const image = screen.getByAltText("Gaming Laptop");
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute("src", "laptop.jpg");
      });
    });
  });

  // ==========================================================================
  // Navigation
  // ==========================================================================
  describe("Navigation", () => {
    it("should navigate back to products page", async () => {
      const { user } = renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText(/Back/i)).toBeInTheDocument();
      });

      const backButton = screen.getByText("Back");
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith("/admin/products");
    });

    it("should navigate to related product on click", async () => {
      renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText("Gaming Mouse")).toBeInTheDocument();
      });

      const relatedProductLink = screen.getByText("Gaming Mouse").closest("a");
      expect(relatedProductLink).toHaveAttribute("href", "/admin/products/2");
    });
  });

  // ==========================================================================
  // Product Actions
  // ==========================================================================
  describe("Product Actions", () => {
    it("should open edit modal", async () => {
      const { user } = renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText("Edit Product")).toBeInTheDocument();
      });

      const editButton = screen.getByText("Edit Product");
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should populate edit form with product data", async () => {
      const { user } = renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText("Gaming Laptop")).toBeInTheDocument();
      });

      const editButton = screen.getByText("Edit Product");
      await user.click(editButton);

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/product title/i);
        expect(titleInput).toHaveValue("Gaming Laptop");
      });
    });



    it("should open delete modal", async () => {
      const { user } = renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText("Delete Product")).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete Product");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    it("should delete product and navigate to products page", async () => {
      mockProductAPI.delete.mockResolvedValue({ success: true });

      const { user } = renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText("Delete Product")).toBeInTheDocument();
      });

      const deleteButton = screen.getByText("Delete Product");
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });

      const dialog = await screen.findByRole("dialog");
      
      await user.click(
            within(dialog).getByRole("button", { name: /delete/i })
          );
      

        await waitFor(() => {
          expect(mockProductAPI.delete).toHaveBeenCalledWith(1);
          expect(mockToast.success).toHaveBeenCalledWith("Product deleted successfully");
        });
    });
  });

  // ==========================================================================
  // Related Products
  // ==========================================================================
  describe("Related Products", () => {
    it("should display related products section", async () => {
      renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText("Related Products")).toBeInTheDocument();
      });
    });

    it("should filter out current product from related", async () => {
      const relatedWithSameProduct = [mockProduct, ...mockRelatedProducts];
      mockProductAPI.getByCategory.mockResolvedValue({ data: relatedWithSameProduct });

      renderProductDetails();

      await waitFor(() => {
        // Current product should not appear in related section
        const gamingLaptops = screen.getAllByText("Gaming Laptop");
        // Only one instance (the main product, not in related)
        expect(gamingLaptops.length).toBe(1);
      });
    });

    it("should show empty state when no related products", async () => {
      mockProductAPI.getByCategory.mockResolvedValue({ data: [] });

      renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText(/no related products found/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Reviews Section
  // ==========================================================================
  describe("Reviews Section", () => {
    it("should display reviews section", async () => {
      renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
      });
    });

    it("should show no reviews message when count is 0", async () => {
      const productWithoutReviews = { 
        ...mockProduct, 
        rating: { rate: 0, count: 0 } 
      };
      mockProductAPI.getById.mockResolvedValue({ data: productWithoutReviews });

      renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText(/no reviews yet/i)).toBeInTheDocument();
      });
    });
  });

 

  // ==========================================================================
  // Edge Cases
  // ==========================================================================
  describe("Edge Cases", () => {
    it("should handle product with missing image", async () => {
      const productWithoutImage = { ...mockProduct, image: "" };
      mockProductAPI.getById.mockResolvedValue({ data: productWithoutImage });

      renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText("Gaming Laptop")).toBeInTheDocument();
      });
    });

    it("should handle very long product titles", async () => {
      const productWithLongTitle = {
        ...mockProduct,
        title: "A".repeat(200),
      };
      mockProductAPI.getById.mockResolvedValue({ data: productWithLongTitle });

      renderProductDetails();

      await waitFor(() => {
        const title = screen.getByText(/A{100,}/);
        expect(title).toBeInTheDocument();
      });
    });



    it("should handle related products fetch failure", async () => {
      mockProductAPI.getByCategory.mockRejectedValue(new Error("Related Error"));

      renderProductDetails();

      await waitFor(() => {
        expect(screen.getByText("Gaming Laptop")).toBeInTheDocument();
      });
    });
  });
});