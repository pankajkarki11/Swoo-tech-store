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
       <ProductDetails />
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

       it("should loads all containers correctly", async () => {
      renderProductDetails();

      await waitFor(() => {

        expect(screen.getByTestId("product-details-grid")).toBeInTheDocument();//grid which divide it into tow colums for product card and related products 
        expect(screen.getByTestId("product-card-grid")).toBeInTheDocument();//thi si the grid which divide it into two columns for product card and review card
        expect(screen.getByTestId("product-card")).toBeInTheDocument();//this is the product card where we can see the product details
        expect(screen.getByTestId("reviews-card")).toBeInTheDocument();//this is the review card where we can see the review of the product

 expect(screen.getByTestId("actions-card")).toBeInTheDocument();//this is the action card where we can apply cruid operations to the product 


        expect(screen.getByTestId("quick-stats-card")).toBeInTheDocument();
        //this is the quick stats card where we can see the quick stats of the product
        expect(screen.getByTestId("related-products-card")).toBeInTheDocument();
//this is the related products card where we can see the related products of same category

      
      });
    });


    
    it("should display product information & UI", async () => {
      renderProductDetails();

      await waitFor(() => {
          const productCard = screen.getByTestId("product-card");
        expect(productCard).toBeInTheDocument();
        expect(productCard).toHaveTextContent("Gaming Laptop");
        expect(productCard).toHaveTextContent("$999.99");
        expect(productCard).toHaveTextContent("electronics");
        expect(productCard).toHaveTextContent(/high-performance gaming laptop/i);
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
          const productCard = screen.getByTestId("product-card");
        expect(productCard).toBeInTheDocument();
        expect(productCard).toHaveTextContent("Gaming Laptop");
        expect(productCard).toHaveTextContent("$999.99");
        expect(productCard).toHaveTextContent("electronics");
        expect(productCard).toHaveTextContent(/high-performance gaming laptop/i);
        expect(productCard).toHaveTextContent("4.5");
        expect(productCard).toHaveTextContent(/120 reviews/i);
        expect(productCard).toHaveTextContent("(120 reviews)");
        expect(productCard).toHaveTextContent("Avg. Rating");
        expect(productCard).toHaveTextContent("Product ID");
      });
    });

   
    it("should handle product with no rating", async () => {
      const productWithoutRating = { ...mockProduct, rating: null };
      mockProductAPI.getById.mockResolvedValue({ data: productWithoutRating });
      renderProductDetails();

      await waitFor(() => {
          const productCard = screen.getByTestId("product-card");
        expect(productCard).toBeInTheDocument();
        expect(productCard).toHaveTextContent("N/A");
        expect(productCard).toHaveTextContent("(0 reviews)");//we dont have any rating so reviews will be 0
      });
    });

    it("should display product image", async () => {
      renderProductDetails();

      await waitFor(() => {
           
        const images=screen.getByTestId("product-image");
        expect(images).toBeInTheDocument();
        expect(images).toHaveAttribute("src", "laptop.jpg");

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
        const backButton = screen.getByTestId("back-button");
        expect(backButton).toBeInTheDocument();
      });

       const backButton = screen.getByTestId("back-button");
      await user.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith("/admin/products");
    });
  });

  // ==========================================================================
  // Product Actions
  // ==========================================================================
  describe("Product Actions", () => {
     it("should open edit modal with product data", async () => {
          const { user } = renderProductDetails();
    
          await waitFor(() => {
            const table = screen.getByTestId("product-card")
            expect(table).toBeInTheDocument();
          });
    
          const editbutton= screen.getByTestId("edit-button");
          await user.click(editbutton);
    
            await waitFor(() => {
    
               expect(screen.getByRole("dialog")).toBeInTheDocument();
                expect(screen.getByRole("button", { name:/Update Product/i})).toBeInTheDocument();
                expect(screen.getByRole("button", { name:/cancel/i})).toBeInTheDocument();
    
            });
          
        });

    it("should populate edit form with product data", async () => {
      const { user } = renderProductDetails();

      await waitFor(() => {
          const table = screen.getByTestId("product-card")
            expect(table).toBeInTheDocument();
      });

        const editbutton= screen.getByTestId("edit-button");
          await user.click(editbutton)

      await waitFor(() => {
        const titleInput = screen.getByLabelText(/product title/i);
        expect(titleInput).toHaveValue("Gaming Laptop");
      });
    });



 it("should open delete modal with product data", async () => {
      const { user } = renderProductDetails();

      await waitFor(() => {
          const table = screen.getByTestId("product-card")
        expect(table).toBeInTheDocument();
      });

      const deletebutton= screen.getByTestId("delete-button");
      await user.click(deletebutton);

        await waitFor(() => {
            expect(screen.getByText(/are you sure you want to delete/i)).toBeInTheDocument();
            expect(screen.getAllByRole("button", { name:/delete/i}).length).toBeGreaterThan(0);
            expect(screen.getByRole("button", { name:/cancel/i})).toBeInTheDocument();

        });
      
    });

    it("should delete product and navigate to products page", async () => {
      mockProductAPI.delete.mockResolvedValue({ success: true });

      const { user } = renderProductDetails();

      await waitFor(() => {
          const table = screen.getByTestId("product-card")
        expect(table).toBeInTheDocument();
      });

       const deletebutton= screen.getByTestId("delete-button");
      await user.click(deletebutton);

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
      it("should fetch and display related products", async () => {
      renderProductDetails();

      await waitFor(() => {
        expect(mockProductAPI.getByCategory).toHaveBeenCalledWith("electronics");
        const relatedProducts = screen.getAllByTestId("related-products-card");
        expect(relatedProducts.length).toBeGreaterThan(0);
        expect(relatedProducts[0]).toHaveTextContent("Gaming Mouse");
        

        expect(screen.getByText("Gaming Mouse")).toBeInTheDocument();
        expect(screen.getByText("Gaming Keyboard")).toBeInTheDocument();
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
        const reviewsSection = screen.getByTestId("reviews-card");
        expect(reviewsSection).toBeInTheDocument();
        expect(reviewsSection).toHaveTextContent("Customer Reviews");
        expect(reviewsSection).toHaveTextContent(/4.5out of 5/i);
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