// tests/cart.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import CartPage from "../../pages/client/Cart";
import { CartProvider, useCart, useQuantity } from "../../contexts/CartContext";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";

// Mock react-router-dom

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock AdminuseApi
vi.mock("../../services/AdminuseApi", () => ({
  default: vi.fn(() => ({
    productAPI: {
      getById: vi.fn().mockResolvedValue({data:null})
    },
    cartAPI: {
      getUserCarts: vi.fn().mockResolvedValue({ success: true, data: [] }),
      update: vi.fn().mockResolvedValue({ success: true }),
      delete: vi.fn().mockResolvedValue({ success: true }),
    },
    authAPI: {
      login: vi.fn(),
    },
    userAPI: {
      getAll: vi.fn(),
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
    CartProvider:({children})=> <>{children}</>,
  };
});

// Mock AuthContext
vi.mock("../../contexts/AuthContext", async () => {
  const actual = await vi.importActual("../../contexts/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Mock react-hot-toast
vi.mock("react-hot-toast", async () => {
  const actual = await vi.importActual("react-hot-toast");
  return {
    ...actual,
    default: {
      success: vi.fn(),
      error: vi.fn(),
      loading: vi.fn(),
      dismiss: vi.fn(),
      info: vi.fn(),
    },
    toast: {
      success: vi.fn(),
      error: vi.fn(),
     
      dismiss: vi.fn(),
      info: vi.fn(),
    },
  };
});

// HELPER FUNCTIONS

// Helper function to render component with providers
const renderWithProviders = (
  ui,
  { authState = {}, cartState = {}, quantityState = {} } = {}
) => {

  // Default cart context
  const defaultCartContext = {
    cart: cartState.cart || [],
    addMultipleToCart:
      cartState.addMultipleToCart ||
      vi.fn().mockResolvedValue({ success: true }),
    removeFromCart:
      cartState.removeFromCart || vi.fn().mockResolvedValue({ success: true }),
    updateQuantity:
      cartState.updateQuantity || vi.fn().mockResolvedValue({ success: true }),
    clearCart:
      cartState.clearCart || vi.fn().mockResolvedValue({ success: true }),
    cartItemCount: cartState.cartItemCount || 0,
    cartStats: cartState.cartStats || { itemCount: 0, totalValue: 0 },
    isSyncing: cartState.isSyncing || false,
    syncCartToAPI:
      cartState.syncCartToAPI || vi.fn().mockResolvedValue({ success: true }),
    getUserCarts:
      cartState.getUserCarts ||
      vi.fn().mockResolvedValue({ success: true, data: [] }),
  };

  // Default auth context
  const defaultAuthContext = {
    user: authState.user || null,
   
    loading: authState.loading || false,
    isAuthenticated: !!authState.user,
    isAdmin: authState.user?.isAdmin || false,
    login: authState.login || vi.fn(),
    logout: authState.logout || vi.fn(),
    updateUser: authState.updateUser || vi.fn(),
    getApi:
      authState.getApi ||
      vi.fn(() => ({
        productAPI: { getById: vi.fn() },
        cartAPI: { getUserCarts: vi.fn(), update: vi.fn(), delete: vi.fn() },
      })),
  };

  // Default quantity context
  const defaultQuantityContext = {
    getCurrentQuantity:
      quantityState.getCurrentQuantity ||
      vi.fn((id, defaultQty) => defaultQty?.toString() || "1"),
    handleQuantityChange: quantityState.handleQuantityChange || vi.fn(),
    handleQuantityBlur: quantityState.handleQuantityBlur || vi.fn(),
    handleQuantityKeyDown: quantityState.handleQuantityKeyDown || vi.fn(),
    handleQuantityAdjust: quantityState.handleQuantityAdjust || vi.fn(),
    validateQuantity: quantityState.validateQuantity || vi.fn(),
    clearEditingQuantity: quantityState.clearEditingQuantity || vi.fn(),
    clearAllEditingQuantities:
      quantityState.clearAllEditingQuantities || vi.fn(),
    updateQuantityDirectly: quantityState.updateQuantityDirectly || vi.fn(),
    editingQuantities: quantityState.editingQuantities || {},
    setEditingQuantities: quantityState.setEditingQuantities || vi.fn(),
  };

  // Mock the hooks
  vi.mocked(useCart).mockReturnValue(defaultCartContext);
  vi.mocked(useAuth).mockReturnValue(defaultAuthContext);
  vi.mocked(useQuantity).mockReturnValue(defaultQuantityContext);

  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            {ui}
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    ),
  };
};

// TESTS

describe("CartPage Testing Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    window.scrollTo = vi.fn();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Empty Cart State", () => {
    it("should show empty cart message when cart is empty", () => {
      renderWithProviders(<CartPage />, {
        cartState: { cart: [], cartItemCount: 0 },
      });
      expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
      expect( screen.getByText(/add some items to your cart/i)).toBeInTheDocument();
      expect( screen.getByRole("button", { name: /start shopping/i }) ).toBeInTheDocument();
    });

    it('should navigate to home when "Start Shopping" button is clicked', async () => {
      const { user } = renderWithProviders(<CartPage />, {
        cartState: { cart: [], cartItemCount: 0 },
      });

      const startShoppingButton = screen.getByRole("button", {
        name: /start shopping/i,
      });
      await user.click(startShoppingButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("Cart with Items", () => {
    const mockCartItems = [
      {
        id: 1,
        title: "Test Product 1",
        price: 29.99,
        quantity: 2,
        image: "test1.jpg",
        category: "Electronics",
        addedAt: new Date().toISOString(),
      },
      {
        id: 2,
        title: "Test Product 2",
        price: 49.99,
        quantity: 1,
        image: "test2.jpg",
        category: "Clothing",
        addedAt: new Date().toISOString(),
      },
    ];

    it("should display cart items correctly", () => {
      renderWithProviders(<CartPage />, {
        cartState: {
          cart: mockCartItems,
          cartItemCount: 3,
          cartStats: { totalValue: 109.97 },
        },
      });

      expect(screen.getByText(/3 items in your cart/i)).toBeInTheDocument();
      expect(screen.getByText("Test Product 1")).toBeInTheDocument();
      expect(screen.getByText("Test Product 2")).toBeInTheDocument();
      expect(screen.getByText("$59.98")).toBeInTheDocument(); // 29.99 * 2
      expect(screen.getByText("$49.99")).toBeInTheDocument();
    });

    it("should show order summary with correct calculations", () => {
      renderWithProviders(<CartPage />, {
        cartState: {
          cart: mockCartItems,
          cartItemCount: 3,
          cartStats: { totalValue: 109.97 },
        },
      });

      expect(screen.getByText("$109.97")).toBeInTheDocument(); // Subtotal
      expect(screen.getByText("FREE")).toBeInTheDocument(); // Free shipping over $100
      expect(screen.getByText("$8.80")).toBeInTheDocument(); // Tax (8% of 109.97)
    });

    it("should show shipping cost when subtotal < $100", () => {
      renderWithProviders(<CartPage />, {
        cartState: {
          cart: [mockCartItems[0]], // Only first item, total = 59.98
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
      });

      expect(screen.getByText("$9.99")).toBeInTheDocument(); // Shipping cost
    });

    it("should show free shipping when subtotal > $100", () => {
      renderWithProviders(<CartPage />, {
        cartState: {
          cart: [{ ...mockCartItems[0], price: 120, quantity: 1 }],
          cartItemCount: 1,
          cartStats: { totalValue: 120 },
        },
      });

      expect(screen.getByText("FREE")).toBeInTheDocument();
    });
  });

  describe("Quantity Controls", () => {
    const mockCartItem = [
      {
        id: 1,
        title: "Test Product",
        price: 29.99,
        quantity: 2,
        image: "test.jpg",
        category: "Electronics",
        addedAt: new Date().toISOString(),
      },
    ];

    it("should have quantity controls for each item", () => {
      renderWithProviders(<CartPage />, {
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
      });

      expect(screen.getByLabelText(/decrease quantity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/increase quantity/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue("2")).toBeInTheDocument();
    });

    it("should call handleQuantityAdjust when increase button is clicked", async () => {
      const mockHandleQuantityAdjust = vi.fn();

      const { user } = renderWithProviders(<CartPage />, {
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
        quantityState: {
          handleQuantityAdjust: mockHandleQuantityAdjust,
        },
      });

      const increaseButton = screen.getByLabelText(/increase quantity/i);
      await user.click(increaseButton);

      expect(mockHandleQuantityAdjust).toHaveBeenCalledWith(
        1,
        1,
        2,
        expect.any(Function),
        { min: 1, max: 10 }
      );
    });

    it("should call handleQuantityAdjust when decrease button is clicked", async () => {
      const mockHandleQuantityAdjust = vi.fn();

      const { user } = renderWithProviders(<CartPage />, {
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
        quantityState: {
          handleQuantityAdjust: mockHandleQuantityAdjust,
        },
      });

      const decreaseButton = screen.getByLabelText(/decrease quantity/i);
      await user.click(decreaseButton);

      expect(mockHandleQuantityAdjust).toHaveBeenCalledWith(
        1,
        -1,
        2,
        expect.any(Function),
        { min: 1, max: 10 }
      );
    });

    it("should disable decrease button when quantity is 1", () => {
      renderWithProviders(<CartPage />, {
        cartState: {
          cart: [{ ...mockCartItem[0], quantity: 1 }],
          cartItemCount: 1,
          cartStats: { totalValue: 29.99 },
        },
        quantityState: {
          getCurrentQuantity: vi.fn(() => "1"),
        },
      });

      const decreaseButton = screen.getByLabelText(/decrease quantity/i);
      expect(decreaseButton).toBeDisabled();
    });
  });

  describe("Modal Interactions", () => {
    const mockCartItem = [
      {
        id: 1,
        title: "Test Product",
        price: 29.99,
        quantity: 2,
        image: "test.jpg",
        category: "Electronics",
        addedAt: new Date().toISOString(),
      },
    ];

    it("should open remove item modal when remove button is clicked", async () => {
      const { user } = renderWithProviders(<CartPage />, {
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
      });

      const removeButton = screen.getByLabelText(/remove item/i);
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText("Remove Item")).toBeInTheDocument();
        expect(
          screen.getByText(/are you sure you want to remove/i)
        ).toBeInTheDocument();
      });
    });

    it("should close modal when cancel button is clicked", async () => {
      const { user } = renderWithProviders(<CartPage />, {
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
      });

      const removeButton = screen.getByLabelText(/remove item/i);
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText("Remove Item")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("Remove Item")).not.toBeInTheDocument();
      });
    });

    it("should call removeFromCart when removal is confirmed", async () => {
      const mockRemoveFromCart = vi.fn().mockResolvedValue({ success: true });

      const { user } = renderWithProviders(<CartPage />, {
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
          removeFromCart: mockRemoveFromCart,
        },
      });

      const removeButton = screen.getByLabelText(/remove item/i);
      await user.click(removeButton);

      await waitFor(() => {
        expect(screen.getByText("Remove Item")).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockRemoveFromCart).toHaveBeenCalledWith(1);
      });
    });

    it("should open clear cart modal", async () => {
      const { user } = renderWithProviders(<CartPage />, {
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
      });

      const clearCartButton = screen.getByRole("button", {
        name: /clear cart/i,
      });
      await user.click(clearCartButton);

      await waitFor(() => {
        // Use getByRole to avoid multiple element error
        expect(
          screen.getByRole("heading", { name: /clear cart/i })
        ).toBeInTheDocument();
        expect(
          screen.getByText(/are you sure you want to clear all/i)
        ).toBeInTheDocument();
      });
    });

    it('should open checkout modal when authenticated user clicks "Proceed to Checkout"', async () => {
      const { user } = renderWithProviders(<CartPage />, {
        authState: {
          user: { id: 1, username: "testuser", isAdmin: false },
        },
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
      });

      const checkoutButton = screen.getByRole("button", {
        name: /proceed to checkout/i,
      });
      await user.click(checkoutButton);

      await waitFor(() => {
        // Use getByRole to avoid multiple element error
        expect(
          screen.getByRole("heading", { name: /proceed to checkout/i })
        ).toBeInTheDocument();
        expect(
          screen.getByText(/proceed to checkout with 2 items/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Authentication Features", () => {
    const mockCartItem = [
      {
        id: 1,
        title: "Test Product",
        price: 29.99,
        quantity: 2,
        image: "test.jpg",
        category: "Electronics",
        addedAt: new Date().toISOString(),
      },
    ];

    it("should show sync button when user is logged in with items in cart", () => {
      renderWithProviders(<CartPage />, {
        authState: {
          user: { id: 1, username: "testuser", isAdmin: false },
        },
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
      });

      expect(
        screen.getByRole("button", { name: /save to server/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /refresh/i })
      ).toBeInTheDocument();
    });

    it("should not show sync button when user is not logged in", () => {
      renderWithProviders(<CartPage />, {
        authState: {
          user: null,
        },
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
      });

      expect(
        screen.queryByRole("button", { name: /save to server/i })
      ).not.toBeInTheDocument();
    });

    it("should show cart history button for logged in users", () => {
      renderWithProviders(<CartPage />, {
        authState: {
          user: { id: 1, username: "testuser", isAdmin: false },
        },
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
      });

      expect(
        screen.getByRole("button", { name: /show cart history/i })
      ).toBeInTheDocument();
    });

    it("should toggle cart history when button is clicked", async () => {
      const mockGetUserCarts = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            id: 1,
            products: [{ productId: 1, quantity: 2 }],
            date: new Date().toISOString(),
          },
        ],
      });

      const { user } = renderWithProviders(<CartPage />, {
        authState: {
          user: { id: 1, username: "testuser", isAdmin: false },
        },
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
          getUserCarts: mockGetUserCarts,
        },
      });

      const showHistoryButton = screen.getByRole("button", {
        name: /show cart history/i,
      });
      await user.click(showHistoryButton);

      await waitFor(() => {
        expect(mockGetUserCarts).toHaveBeenCalledWith(1);
      });
    });

    it("should show auto-sync info banner when user is logged in", () => {
      renderWithProviders(<CartPage />, {
        authState: {
          user: { id: 1, username: "testuser", isAdmin: false },
        },
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
      });

      expect(screen.getByText("Auto-sync Info")).toBeInTheDocument();
      expect(
        screen.getByText(/your cart automatically syncs/i)
      ).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it('should navigate back to home when "Continue Shopping" is clicked', async () => {
      const { user } = renderWithProviders(<CartPage />, {
        cartState: {
          cart: [],
          cartItemCount: 0,
        },
      });

      const continueShoppingButton = screen.getByRole("button", {
        name: /continue shopping/i,
      });
      await user.click(continueShoppingButton);

      expect(mockNavigate).toHaveBeenCalledWith("/");
    });

    it("should navigate to checkout when authenticated user confirms", async () => {
      const mockCartItem = [
        {
          id: 1,
          title: "Test Product",
          price: 29.99,
          quantity: 2,
          image: "test.jpg",
          category: "Electronics",
          addedAt: new Date().toISOString(),
        },
      ];

      const { user } = renderWithProviders(<CartPage />, {
        authState: {
          user: { id: 1, username: "testuser", isAdmin: false },
        },
        cartState: {
          cart: mockCartItem,
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
        },
      });

      const checkoutButton = screen.getByRole("button", {
        name: /proceed to checkout/i,
      });
      await user.click(checkoutButton);

      await waitFor(() => {
        // Use getByRole to avoid multiple element error
        expect(
          screen.getByRole("heading", { name: /proceed to checkout/i })
        ).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", { name: /confirm/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/checkout");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should disable checkout button when cart is empty (authenticated)", () => {
      renderWithProviders(<CartPage />, {
        authState: {
          user: { id: 1, username: "testuser", isAdmin: false },
        },
        cartState: {
          cart: [],
          cartItemCount: 0,
          cartStats: { totalValue: 0 },
        },
      });

      const checkoutButton = screen.getByRole("button", {
        name: /proceed to checkout/i,
      });
      expect(checkoutButton).toBeDisabled();
    });

    it("should disable checkout button when cart is empty (non-authenticated)", () => {
      renderWithProviders(<CartPage />, {
        authState: {
          user: null,
        },
        cartState: {
          cart: [],
          cartItemCount: 0,
          cartStats: { totalValue: 0 },
        },
      });

      const loginButton = screen.getByRole("button", {
        name: /login to checkout/i,
      });
      expect(loginButton).toBeDisabled();
    });

    it("should disable buttons when syncing", () => {
      renderWithProviders(<CartPage />, {
        authState: {
          user: { id: 1, username: "testuser", isAdmin: false },
        },
        cartState: {
          cart: [
            {
              id: 1,
              title: "Test Product",
              price: 29.99,
              quantity: 2,
              image: "test.jpg",
              category: "Electronics",
              addedAt: new Date().toISOString(),
            },
          ],
          cartItemCount: 2,
          cartStats: { totalValue: 59.98 },
          isSyncing: true,
        },
      });

      const syncButton = screen.getByRole("button", { name: /syncing/i });
      expect(syncButton).toBeDisabled();
    });

    it("should handle items with zero price", () => {
      const freeItem = [
        {
          id: 1,
          title: "Free Product",
          price: 0,
          quantity: 1,
          image: "test.jpg",
          category: "Free",
          addedAt: new Date().toISOString(),
        },
      ];

      renderWithProviders(<CartPage />, {
        cartState: {
          cart: freeItem,
          cartItemCount: 1,
          cartStats: { totalValue: 0 },
        },
      });

      expect(screen.getByText("$0.00 each")).toBeInTheDocument();
    });

    it("should handle very long product titles", () => {
      const longTitleItem = [
        {
          id: 1,
          title:
            "This is a very long product title that should be truncated or handled properly in the UI",
          price: 29.99,
          quantity: 1,
          image: "test.jpg",
          category: "Test",
          addedAt: new Date().toISOString(),
        },
      ];

      renderWithProviders(<CartPage />, {
        cartState: {
          cart: longTitleItem,
          cartItemCount: 1,
          cartStats: { totalValue: 29.99 },
        },
      });

      expect(
        screen.getByText(/this is a very long product title/i)
      ).toBeInTheDocument();
    });
  });

  describe("Checkout Button - Authentication States", () => {
    const mockCartItem = [
      {
        id: 1,
        title: "Test Product",
        price: 29.99,
        quantity: 2,
        image: "test.jpg",
        category: "Electronics",
        addedAt: new Date().toISOString(),
      },
    ];

    describe("Authenticated Users", () => {
      it('should show "Proceed to Checkout" button when user is authenticated', () => {
        renderWithProviders(<CartPage />, {
          authState: {
            user: { id: 1, username: "testuser", isAdmin: false },
          },
          cartState: {
            cart: mockCartItem,
            cartItemCount: 2,
            cartStats: { totalValue: 59.98 },
          },
        });

        // Should show "Proceed to Checkout" for authenticated users
        expect(
          screen.getByRole("button", { name: /proceed to checkout/i })
        ).toBeInTheDocument();

        // Should NOT show "Login to Checkout"
        expect(
          screen.queryByRole("button", { name: /login to checkout/i })
        ).not.toBeInTheDocument();
      });

      it('should enable "Proceed to Checkout" button when cart has items', () => {
        renderWithProviders(<CartPage />, {
          authState: {
            user: { id: 1, username: "testuser", isAdmin: false },
          },
          cartState: {
            cart: mockCartItem,
            cartItemCount: 2,
            cartStats: { totalValue: 59.98 },
          },
        });

        const checkoutButton = screen.getByRole("button", {
          name: /proceed to checkout/i,
        });
        expect(checkoutButton).toBeEnabled();
      });
    });

    describe("Non-Authenticated Users", () => {
      it('should show "Login to Checkout" button when user is not authenticated', () => {
        renderWithProviders(<CartPage />, {
          authState: {
            user: null,
          },
          cartState: {
            cart: mockCartItem,
            cartItemCount: 2,
            cartStats: { totalValue: 59.98 },
          },
        });

        // Should show "Login to Checkout" for non-authenticated users
        expect(
          screen.getByRole("button", { name: /login to checkout/i })
        ).toBeInTheDocument();

        // Should NOT show "Proceed to Checkout"
        expect(
          screen.queryByRole("button", { name: /proceed to checkout/i })
        ).not.toBeInTheDocument();
      });

      it('should navigate to login page when "Login to Checkout" is clicked', async () => {
        const { user } = renderWithProviders(<CartPage />, {
          authState: {
            user: null,
          },
          cartState: {
            cart: mockCartItem,
            cartItemCount: 2,
            cartStats: { totalValue: 59.98 },
          },
        });

        const loginButton = screen.getByRole("button", {
          name: /login to checkout/i,
        });
        await user.click(loginButton);

        // Should navigate directly to login page (no modal)
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });

      it('should disable "Login to Checkout" button when cart is empty', () => {
        renderWithProviders(<CartPage />, {
          authState: {
            user: null,
          },
          cartState: {
            cart: [],
            cartItemCount: 0,
            cartStats: { totalValue: 0 },
          },
        });

        const loginButton = screen.getByRole("button", {
          name: /login to checkout/i,
        });
        expect(loginButton).toBeDisabled();
      });

      it('should enable "Login to Checkout" button when cart has items', () => {
        renderWithProviders(<CartPage />, {
          authState: {
            user: null,
          },
          cartState: {
            cart: mockCartItem,
            cartItemCount: 2,
            cartStats: { totalValue: 59.98 },
          },
        });

        const loginButton = screen.getByRole("button", {
          name: /login to checkout/i,
        });
        expect(loginButton).toBeEnabled();
      });

      it('should not open modal when non-authenticated user clicks "Login to Checkout"', async () => {
        const { user } = renderWithProviders(<CartPage />, {
          authState: {
            user: null,
          },
          cartState: {
            cart: mockCartItem,
            cartItemCount: 2,
            cartStats: { totalValue: 59.98 },
          },
        });

        const loginButton = screen.getByRole("button", {
          name: /login to checkout/i,
        });
        await user.click(loginButton);

        // Should NOT show checkout modal
        expect(
          screen.queryByRole("heading", { name: /proceed to checkout/i })
        ).not.toBeInTheDocument();

        // Should navigate to login
        expect(mockNavigate).toHaveBeenCalledWith("/login");
      });
    });

    describe("Button Behavior Differences", () => {
      it("authenticated user button opens modal before navigation", async () => {
        const { user } = renderWithProviders(<CartPage />, {
          authState: {
            user: { id: 1, username: "testuser", isAdmin: false },
          },
          cartState: {
            cart: mockCartItem,
            cartItemCount: 2,
            cartStats: { totalValue: 59.98 },
          },
        });

        const checkoutButton = screen.getByRole("button", {
          name: /proceed to checkout/i,
        });
        await user.click(checkoutButton);

        // Modal should open
        await waitFor(() => {
          expect(
            screen.getByRole("heading", { name: /proceed to checkout/i })
          ).toBeInTheDocument();
        });

        // Navigate only happens after confirm
        expect(mockNavigate).not.toHaveBeenCalled();

        // Click confirm
        const confirmButton = screen.getByRole("button", { name: /confirm/i });
        await user.click(confirmButton);

        // Now navigation happens
        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith("/checkout");
        });
      });

      it("non-authenticated user button navigates immediately without modal", async () => {
        const { user } = renderWithProviders(<CartPage />, {
          authState: {
            user: null,
          },
          cartState: {
            cart: mockCartItem,
            cartItemCount: 2,
            cartStats: { totalValue: 59.98 },
          },
        });

        const loginButton = screen.getByRole("button", {
          name: /login to checkout/i,
        });
        await user.click(loginButton);

        // Should navigate immediately (no modal)
        expect(mockNavigate).toHaveBeenCalledWith("/login");

        // Should NOT show modal
        expect(
          screen.queryByRole("heading", { name: /proceed to checkout/i })
        ).not.toBeInTheDocument();
      });
    });
  });
});
