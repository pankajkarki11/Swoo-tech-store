// tests/product-detail.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import ProductDetailPage from "../../pages/client/ProductDetailPage";
import { CartProvider, useCart, useQuantity } from "../../contexts/CartContext";
import { AuthProvider } from "../../contexts/AuthContext";

// Mock react-router-dom
const mockNavigate = vi.fn();
const mockUseParams = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockUseParams(),
  };
});

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock AdminuseApi
const mockGetById = vi.fn();
vi.mock("../../services/AdminuseApi", () => ({
  default: vi.fn(() => ({
    productAPI: {
      getById: mockGetById,
    },
  })),
}));

// Mock CartContext
vi.mock("../../contexts/CartContext", async () => {
  const actual = await vi.importActual("../../contexts/CartContext");
  return {
    ...actual,
    useCart: vi.fn(),
    useQuantity: vi.fn(),
  };
});





// Helper function to render component with providers
const renderWithProviders = (
  ui,
  { 
    cartState = {}, 
    quantityState = {},
   params = {}
  } = {}
) => {
  // Default cart context
  const defaultCartContext = {
    addToCart: cartState.addToCart || vi.fn().mockResolvedValue({ success: true }),
    isInCart: cartState.isInCart || vi.fn().mockReturnValue(false),
    getCartItemQuantity: cartState.getCartItemQuantity || vi.fn().mockReturnValue(0),
  };

  // Default quantity context
  const defaultQuantityContext = {
    getCurrentQuantity: quantityState.getCurrentQuantity || vi.fn((id, defaultQty) => defaultQty?.toString() || "1"),
    handleQuantityChange: quantityState.handleQuantityChange || vi.fn(),
    clearEditingQuantity: quantityState.clearEditingQuantity || vi.fn(),
  };

  // Set up params
  mockUseParams.mockReturnValue(params);

  // Mock the hooks
  const mockCart = vi.mocked(useCart);
  const mockQuantity = vi.mocked(useQuantity);
  
  mockCart.mockReturnValue(defaultCartContext);
  mockQuantity.mockReturnValue(defaultQuantityContext);

  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            {ui}
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    ),
   
  };
};

// Sample product data
const mockProduct = {
  id: 1,
  title: "Test Product",
  description: "This is a detailed product description for testing purposes.",
  price: 99.99,
  image: "test-image.jpg",
  category: "electronics",
  rating: {
    rate: 4.5,
    count: 120,
  },
};

// TESTS
describe("ProductDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockGetById.mockClear();
    window.scrollTo = vi.fn();
    mockUseParams.mockReturnValue({ id: "1" });
      vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  describe("Testing ProductDetailPage when there is No product", () => {
    it("Should load all the products details", async() => {
      mockGetById.mockImplementation(() => new Promise(() => {})); // Never resolves
      const {user}=renderWithProviders(<ProductDetailPage />, {
        params: { id: "123" },
      });
      expect(mockGetById).toHaveBeenCalledWith("123");//called the product detail page with id in the url 
      expect(screen.getByText("Loading product details...")).toBeInTheDocument();

    });

    it('should navigate back when "Go Back" button is clicked', async () => {
      mockGetById.mockRejectedValue(new Error("Not found"));
      const { user } = renderWithProviders(<ProductDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Product Not Found")).toBeInTheDocument();
      });

      const goBackButton = screen.getByText("Go Back");
      await user.click(goBackButton);

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });

    it('should navigate to home when "Browse Products" button is clicked', async () => {
      mockGetById.mockRejectedValue(new Error("Not found"));
      const { user } = renderWithProviders(<ProductDetailPage />);

      await waitFor(() => {
        expect(screen.getByText("Product Not Found")).toBeInTheDocument();
      });

      const browseButton = screen.getByText("Browse Products");
      await user.click(browseButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });



  describe("Product Display Test when There is a product", () => {
    beforeEach(() => {
      mockGetById.mockResolvedValue({ data: mockProduct });
    });

     it("should display product information correctly", async () => {
        renderWithProviders(<ProductDetailPage />);
  // Title
  expect(await screen.findByRole("heading", { level: 1, name: new RegExp(mockProduct.title, "i"), })
  ).toBeInTheDocument();

  // Price
  expect(
    await screen.findByText(
      new RegExp(`\\$${mockProduct.price.toFixed(2)}`)
    )
  ).toBeInTheDocument();

  // Description
  expect(
    await screen.findByText((text) =>
      text.includes(mockProduct.description)
    )
  ).toBeInTheDocument();

  // ✅ Category badge ONLY (scoped)
  const categoryBadge = await screen.findByText(
    mockProduct.category.toUpperCase()
  );

  expect(categoryBadge).toBeInTheDocument();
//to shows rating information
    await waitFor(() => {
        expect(screen.getByText(`${mockProduct.rating.rate.toFixed(1)}/5`)).toBeInTheDocument();
        expect(screen.getByText(`${mockProduct.rating.count} reviews`)).toBeInTheDocument();
      });

//should show images
 await waitFor(() => {
        const mainImage = screen.getByAltText(mockProduct.title);
        expect(mainImage).toHaveAttribute("src", mockProduct.image);
      });

      expect(screen.getByText("Max 10 per customer")).toBeInTheDocument();

        //reviews section
       expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
        expect(screen.getByText("4.5/5")).toBeInTheDocument();
        expect(screen.getByText("120 total reviews")).toBeInTheDocument();
        expect(screen.getByText("Write a Review")).toBeInTheDocument();

        expect(screen.getByText("No reviews yet for this product")).toBeInTheDocument();
        expect(screen.getByText("Be the first to share your thoughts!")).toBeInTheDocument();
});

    it("should show free shipping for products over $100", async () => {
      const expensiveProduct = { ...mockProduct, price: 150 };
      mockGetById.mockResolvedValue({ data: expensiveProduct });
      renderWithProviders(<ProductDetailPage />);
      await waitFor(() => {
        expect(screen.getByText("FREE SHIPPING")).toBeInTheDocument();
      });
    });

    it("should not show free shipping for products under $100", async () => {
      renderWithProviders(<ProductDetailPage />);

      await waitFor(() => {
        expect(screen.queryByText("FREE SHIPPING")).not.toBeInTheDocument();
      });
    });

    it("should increase quantity when plus button is clicked", async () => {
      const mockHandleQuantityChange = vi.fn();
      const { user } = renderWithProviders(<ProductDetailPage />, {
        quantityState: {
          handleQuantityChange: mockHandleQuantityChange,
          getCurrentQuantity: vi.fn(() => "1"),
        },
      });

      //check initial quantity before adding to cart which is 1
        await waitFor(() => {
        expect(screen.getByTestId("quantity-input")).toHaveValue("1");
        expect(screen.getByText("Add to Cart (1)")).toBeInTheDocument();
      });
       
      const increaseButton = screen.getByLabelText("Increase quantity");
      await user.click(increaseButton);
      
      expect(mockHandleQuantityChange).toHaveBeenCalledWith(mockProduct.id, "2");//quantity changed when we click on plus button
    });

    it("should decrease quantity when minus button is clicked", async () => {
      const mockHandleQuantityChange = vi.fn();
      const { user } = renderWithProviders(<ProductDetailPage />, {
        quantityState: {
          handleQuantityChange: mockHandleQuantityChange,
          getCurrentQuantity: vi.fn(() => "2"),
        },
      });
      await waitFor(() => {
        expect(screen.getByText("Add to Cart (2)")).toBeInTheDocument();
      });
      const decreaseButton = screen.getByLabelText("Decrease quantity");
      await user.click(decreaseButton);
      expect(mockHandleQuantityChange).toHaveBeenCalledWith(mockProduct.id, "1");
    });

    it("should not decrease below 1", async () => {
      const mockHandleQuantityChange = vi.fn();
      renderWithProviders(<ProductDetailPage />, {
        quantityState: {
          handleQuantityChange: mockHandleQuantityChange,
          getCurrentQuantity: vi.fn(() => "1"),
        },
      });
      await waitFor(() => {
        const decreaseButton = screen.getByLabelText("Decrease quantity");
        expect(decreaseButton).toBeDisabled();//when we have quantity aas 1 so we cannot decrease it to 0 which should be disabled in the ui.
      });
    });

    it("should not increase above max quantity (10)", async () => {
      const mockHandleQuantityChange = vi.fn();
      renderWithProviders(<ProductDetailPage />, {
        quantityState: {
          handleQuantityChange: mockHandleQuantityChange,
          getCurrentQuantity: vi.fn(() => "10"),
        },
      });
      await waitFor(() => {
        const increaseButton = screen.getByLabelText("Increase quantity");
        expect(increaseButton).toBeDisabled();
      });
    });

    it("should handle quantity input change", async () => {
      const mockHandleQuantityChange = vi.fn();
      const { user } = renderWithProviders(<ProductDetailPage />, {
        quantityState: {
          handleQuantityChange: mockHandleQuantityChange,
          getCurrentQuantity: vi.fn(() => "3"),
        },
      });
      await waitFor(() => {
        const quantityInput = screen.getByTestId("quantity-input");
        expect(quantityInput).toBeInTheDocument();
         
      });
       const quantityInput = screen.getByTestId("quantity-input");
       await user.type(quantityInput, "5"); 
      expect(mockHandleQuantityChange).toHaveBeenCalled();

    });

    it("should show current cart quantity when product is in cart", async () => {
      renderWithProviders(<ProductDetailPage />, {
        cartState: {
          isInCart: vi.fn().mockReturnValue(true),
          getCartItemQuantity: vi.fn().mockReturnValue(2),
        },
        quantityState: {
          getCurrentQuantity: vi.fn(() => "2"),
        },
      });

      await waitFor(() => {
        expect(screen.getByTestId("quantity-input")).toHaveValue("2");
        expect(screen.getByText("Update in Cart (2)")).toBeInTheDocument();
        expect(screen.getByText("2 × Test Product in cart")).toBeInTheDocument();
          expect(screen.getByText("Remove")).toBeInTheDocument();
      });
    });




    it("should add product to cart first if not already in cart when clicking Buy Now", async () => {
      const mockAddToCart = vi.fn().mockResolvedValue({ success: true });
      const { user } = renderWithProviders(<ProductDetailPage />, {
        cartState: {
          addToCart: mockAddToCart,
          isInCart: vi.fn().mockReturnValue(false),
        },
        quantityState: {
          getCurrentQuantity: vi.fn(() => "2"),
        },
      });

      await waitFor(() => {
        expect(screen.getByText("⚡ Buy Now")).toBeInTheDocument();
      });

      const buyNowButton = screen.getByText("⚡ Buy Now");
      await user.click(buyNowButton);

      expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 2);
      expect(mockNavigate).toHaveBeenCalledWith("/cart");
    });

    it("should not add to cart if already in cart when buying now", async () => {
      const mockAddToCart = vi.fn().mockResolvedValue({ success: true });
      const { user } = renderWithProviders(<ProductDetailPage />, {
        cartState: {
          addToCart: mockAddToCart,
          isInCart: vi.fn().mockReturnValue(true),
          getCartItemQuantity: vi.fn().mockReturnValue(2),
        },
      });

      await waitFor(() => {
        expect(screen.getByText("⚡ Buy Now")).toBeInTheDocument();
      });

      const buyNowButton = screen.getByText("⚡ Buy Now");
      await user.click(buyNowButton);

      expect(mockAddToCart).not.toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/cart");
    });

    it("should handle quantity greater than max", async () => {
      const mockToastError = vi.fn();
      require("react-hot-toast").toast.error = mockToastError;
      const mockClearEditingQuantity = vi.fn();
      
      const { user } = renderWithProviders(<ProductDetailPage />, {
        quantityState: {
          getCurrentQuantity: vi.fn(() => "15"), // Too high
          clearEditingQuantity: mockClearEditingQuantity,
        },
      });

      // Test the handler directly
      const handleQuantityInputBlur = vi.fn().mockImplementation((productId, currentQuantity) => {
        const quantityStr = "15";
        const qty = parseInt(quantityStr);
        
        if (qty > 10) {
          mockToastError("Maximum 10 per customer");
          mockClearEditingQuantity(productId);
          return;
        }
      });

      handleQuantityInputBlur(mockProduct.id, 1);

      expect(mockToastError).toHaveBeenCalledWith("Maximum 10 per customer");
      expect(mockClearEditingQuantity).toHaveBeenCalledWith(mockProduct.id);
    });
    });
  });