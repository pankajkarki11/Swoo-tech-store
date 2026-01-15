import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import ProductCard from "../../components_temp/ProductCard";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";

// Mock useAuth hook
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock useCart hook
vi.mock("../../contexts/CartContext", () => ({
  useCart: vi.fn(),
}));

// Mock react-hot-toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockProduct = {
  id: 1,
  title: "Test Product",
  description: "This is a test product description",
  category: "electronics",
  price: 49.99,
  image: "test.jpg",
  rating: {
    rate: 4.3,
    count: 120,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const mockCartContext = (overrides = {}) => {
  useCart.mockReturnValue({
    addToCart: vi.fn().mockResolvedValue(undefined),
    isInCart: vi.fn().mockReturnValue(false),
    getCartItemQuantity: vi.fn().mockReturnValue(0),
    isSyncing: false,
    ...overrides,
  });
};

const mockAuthContext = (user = null) => {
  useAuth.mockReturnValue({
    user,
  });
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <ProductCard product={mockProduct} />
    </BrowserRouter>
  );

// ============================================================================
// TESTS
// ============================================================================

describe("ProductCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCartContext();
    mockAuthContext();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe("Testing Product Card", () => {
    it("Renders product information correctly", () => {
      renderComponent();
      expect(screen.getByText("Test Product")).toBeInTheDocument();
      expect(screen.getByText("ELECTRONICS")).toBeInTheDocument();
      expect(screen.getByText("$49.99")).toBeInTheDocument();
      expect(screen.getByText("4.3")).toBeInTheDocument();
      expect(screen.getByText("(120)")).toBeInTheDocument();

      const image = screen.getByAltText("Test Product");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "test.jpg");


     expect(screen.getByText("Great Value")).toBeInTheDocument();//for the product under $50 it shows great value.
    });

    it("navigates to product detail page when card is clicked", async () => {
      const user = userEvent.setup();
      renderComponent();

      const card = screen.getByTestId("product-card");
      await user.click(card);

      await waitFor(() => {
    expect(window.location.pathname).toBe("/products/1");//should shows the url as that when we click on the product oage we go to the product detail page.
  });
 });

    it("calls addToCart when Add to Cart button is clicked", async () => {
      const user = userEvent.setup();
      const mockAddToCart = vi.fn().mockResolvedValue(undefined);
      
      mockCartContext({ addToCart: mockAddToCart });
      renderComponent();

      const addButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addButton);

      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1);
      });
    });

    it("shows adding state while addToCart is in progress", async () => {
      const user = userEvent.setup();
      const mockAddToCart = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      mockCartContext({ addToCart: mockAddToCart });
      renderComponent();

      const addButton = screen.getByRole("button", { name: /add to cart/i });
      await user.click(addButton);

      expect(screen.getByText(/adding/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(mockAddToCart).toHaveBeenCalled();
      });
    });

  it("disables Add to Cart button if product is already in cart", () => {
      mockCartContext({
        isInCart: vi.fn().mockReturnValue(true),
        getCartItemQuantity: vi.fn().mockReturnValue(2),
      });
      renderComponent();

      const button = screen.getByRole("button", { name: /added to cart/i });
      expect(button).toBeDisabled();
    });

    it("shows In Cart badge with quantity", () => {
      mockCartContext({
        isInCart: vi.fn().mockReturnValue(true),
        getCartItemQuantity: vi.fn().mockReturnValue(3),
      });

      renderComponent();

      expect(screen.getByText("In Cart (3)")).toBeInTheDocument();
    });

    it("does not show badge when product is not in cart", () => {
      mockCartContext({
        isInCart: vi.fn().mockReturnValue(false),
        getCartItemQuantity: vi.fn().mockReturnValue(0),
      });

      renderComponent();

      expect(screen.queryByText(/in cart/i)).not.toBeInTheDocument();
    });

    it("shows syncing message when cart is syncing", () => {
      mockAuthContext({ id: "123", name: "Test User" });
      mockCartContext({
        isInCart: vi.fn().mockReturnValue(true),
        getCartItemQuantity: vi.fn().mockReturnValue(1),
        isSyncing: true,
      });

      renderComponent();

      expect(screen.getByText(/syncing to server/i)).toBeInTheDocument();
    });

    it("does not show sync status when user is not logged in", () => {
      mockAuthContext(null);
      mockCartContext({
        isInCart: vi.fn().mockReturnValue(true),
        getCartItemQuantity: vi.fn().mockReturnValue(1),
      });

      renderComponent();

      expect(screen.queryByText(/synced to server/i)).not.toBeInTheDocument();
    });
  });
});