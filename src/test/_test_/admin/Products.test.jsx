// tests/Products.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor,within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "../../../pages/admin/Products";

// ============================================================================
// MOCKS
// ============================================================================


const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,

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
      <Products />
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

    it("should display products UI after loading", async () => {
      renderProducts();

      await waitFor(() => {

        //visual checks
        expect(screen.getByText("Laptop")).toBeInTheDocument();
        expect(screen.getByText("T-Shirt")).toBeInTheDocument();
        expect(screen.getByText("$999.99")).toBeInTheDocument();
        expect(screen.getByText("$19.99")).toBeInTheDocument();
        expect(screen.getByText("electronics")).toBeInTheDocument();
        expect(screen.getByText("clothing")).toBeInTheDocument();
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();//should be disabled when we loaded the product in the DOM

        expect(screen.getByTestId("products-page-container")).toBeInTheDocument();//this is the main container of the page

        expect(screen.getByTestId("stats-grid")).toBeInTheDocument();//this shows the grid of stat card is visible and is there
        expect(screen.getByTestId("filters-card")).toBeInTheDocument();//this is the section where we can filter product and search the product 
        expect(screen.getByTestId("refresh-button")).toBeInTheDocument();//this is refresh button available to refresh all the products
         expect(screen.getByTestId("add-new-button")).toBeInTheDocument(); //this is add new product button used to add new product to the list
          expect(screen.getByTestId("clear-filters-button")).toBeInTheDocument(); //this clears the filers

           expect(screen.getByTestId("products-table")).toBeInTheDocument();
           //this is the table where all the products are displayed
      });
    });

    it("should handle API errors", async () => {
      mockProductAPI.getAll.mockRejectedValue(new Error("API Error"));
      renderProducts();

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith("Failed to load data");
      });
    });

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
  // Statistics Display
  // ==========================================================================
  describe("Statistics Display", () => {
    it("should display total products count", async () => {
      renderProducts();

      await waitFor(() => {
        const totalProducts = screen.getByTestId("total-products-card");
        expect(totalProducts).toBeInTheDocument();
        expect(totalProducts).toHaveTextContent("2");
      });
    });

    it("should display categories count", async () => {
      renderProducts();

      await waitFor(() => {
        const totalCategories = screen.getByTestId("total-categories-card");
        expect(totalCategories).toBeInTheDocument();
        expect(totalCategories).toHaveTextContent("3");
      });
    });

    it("should calculate average price", async () => {
      renderProducts();

      // Average: (999.99 + 19.99) / 2 = 509.99
      await waitFor(() => {
          const averagePrice = screen.getByTestId("avg-price-card");
        expect(averagePrice).toBeInTheDocument();
        expect(averagePrice).toHaveTextContent("$509.99");  
      });
    });

      it("should display filtered products count", async () => {
      renderProducts();

      await waitFor(() => {
   const filteredProducts = screen.getByTestId("filtered-products-card");
          expect(filteredProducts).toBeInTheDocument();
          expect(filteredProducts).toHaveTextContent("2"); 
      });
    });
  });

  // ==========================================================================
  // Search & Filter
  // ==========================================================================
  describe("Search & Filter functions and UI", () => {
    it("should filter products by search term", async () => {
      const { user } = renderProducts();

      await waitFor(() => {

        const table = screen.getByTestId("products-table")
        expect(table).toBeInTheDocument();
        expect(table).toHaveTextContent("Laptop");
        expect(table).toHaveTextContent("T-Shirt");//visible bbefore searching
      });

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "Laptop");

      await waitFor(() => {
        const table = screen.getByTestId("products-table")
        expect(table).toBeInTheDocument();
        expect(table).toHaveTextContent("Laptop");
        expect(table).not.toHaveTextContent("T-Shirt");//not visible after searching
      });
    });

    it("should filter products by category", async () => {
      const { user } = renderProducts();

      await waitFor(() => {
      const table = screen.getByTestId("products-table")
        expect(table).toBeInTheDocument();
        expect(table).toHaveTextContent("Laptop");
        expect(table).toHaveTextContent("T-Shirt");
      });

      const categorySelect = screen.getByTestId("category-select");
      await user.selectOptions(categorySelect, "clothing");

      await waitFor(() => {
          const table = screen.getByTestId("products-table")
        expect(table).toBeInTheDocument();
        expect(table).toHaveTextContent("T-Shirt");
        expect(table).not.toHaveTextContent("Laptop");
        expect(table).not.toHaveTextContent("electronics");

      });
    });

    it("Clear filters test", async () => {
      const { user } = renderProducts();

          await waitFor(() => {

        const table = screen.getByTestId("products-table")
        expect(table).toBeInTheDocument();
        expect(table).toHaveTextContent("Laptop");
        expect(table).toHaveTextContent("T-Shirt");//visible bbefore searching
      });

      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "Laptop");

      await waitFor(() => {
        const table = screen.getByTestId("products-table")
        expect(table).toBeInTheDocument();
        expect(table).toHaveTextContent("Laptop");
        expect(table).not.toHaveTextContent("T-Shirt");//not visible after searching
      });

      // Clear filters
      const clearButton = screen.getByTestId("clear-filters-button");
      await user.click(clearButton);

      await waitFor(() => {

         const table = screen.getByTestId("products-table")
        expect(table).toBeInTheDocument();
        expect(table).toHaveTextContent("Laptop");
        expect(table).toHaveTextContent("T-Shirt")

        expect(searchInput).toHaveValue("");
       
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
        const table = screen.getByTestId("products-table")
        expect(table).toBeInTheDocument();
        expect(table).toHaveTextContent("Laptop");
      });

      const addButton = screen.getByTestId("add-new-button");
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByRole("button", { name:/cancel/i})).toBeInTheDocument();
        expect(screen.getByRole("button", { name:/create product/i})).toBeInTheDocument();
      });
    });

    it("should open edit modal with product data", async () => {
      const { user } = renderProducts();

      await waitFor(() => {
        const table = screen.getByTestId("products-table")
        expect(table).toBeInTheDocument();
        expect(table).toHaveTextContent("Laptop");
      });

      const editbutton= screen.getAllByTestId("edit-button")[0];
      await user.click(editbutton);

        await waitFor(() => {

           expect(screen.getByRole("dialog")).toBeInTheDocument();
            expect(screen.getByText("Edit Product")).toBeInTheDocument();
            expect(screen.getByRole("button", { name:/Update Product/i})).toBeInTheDocument();
            expect(screen.getByRole("button", { name:/cancel/i})).toBeInTheDocument();

        });
      
    });
      it("should open delete modal with product data", async () => {
      const { user } = renderProducts();

      await waitFor(() => {
          const table = screen.getByTestId("products-table")
        expect(table).toBeInTheDocument();
        expect(table).toHaveTextContent("Laptop");
      });

      const deletebutton= screen.getAllByTestId("delete-button")[0];
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
});