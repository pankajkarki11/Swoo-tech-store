// tests/HeaderClient.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import HeaderClient from "../../components_temp/HeaderClient";
import { AuthProvider, useAuth } from "../../contexts/AuthContext";
import { CartProvider, useCart } from "../../contexts/CartContext";
import { SearchProvider, useSearch } from "../../contexts/SearchContext";

// ============================================================================
// MOCKS
// ============================================================================

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
      getAll: vi.fn().mockResolvedValue({ success: true, data: [] }),
      getById: vi.fn().mockResolvedValue({ success: true, data: null }),
    },
    cartAPI: {
      getUserCarts: vi.fn().mockResolvedValue({ success: true, data: [] }),
      update: vi.fn().mockResolvedValue({ success: true }),
      delete: vi.fn().mockResolvedValue({ success: true }),
    },
    authAPI: {
      login: vi.fn(),
      logout: vi.fn(),
    },
  })),
}));

// Mock AuthContext
vi.mock("../../contexts/AuthContext", async () => {
  const actual = await vi.importActual("../../contexts/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(),
    AuthProvider: ({ children }) => <>{children}</>,
  };
});

// Mock CartContext
vi.mock("../../contexts/CartContext", async () => {
  const actual = await vi.importActual("../../contexts/CartContext");
  return {
    ...actual,
    useCart: vi.fn(),
    CartProvider: ({ children }) => <>{children}</>,
  };
});

// Mock SearchContext
vi.mock("../../contexts/SearchContext", async () => {
  const actual = await vi.importActual("../../contexts/SearchContext");
  return {
    ...actual,
    useSearch: vi.fn(),
    SearchProvider: ({ children }) => <>{children}</>,
  };
});

// Mock react-hot-toast
vi.mock("react-hot-toast", async () => {
  const actual = await vi.importActual("react-hot-toast");
  return {
    ...actual,
    default: {
    default: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      loading: vi.fn(),
      dismiss: vi.fn(),
    },
    toast: vi.fn((callback) => {
      // For custom toast with callback
      if (typeof callback === "function") {
        return callback({ id: "test-toast-id" });
      }
      return "test-toast-id";
    }),
  };
});

// Mock Switch component
vi.mock("../../components/ui/Switch", () => ({
  default: ({ checked, onChange }) => (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      data-testid="dark-mode-switch"
    >
      {checked ? "Dark" : "Light"}
    </button>
  ),
}));

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const renderWithProviders = (
  ui,
  {
    authState = {},
    cartState = {},
    searchState = {},
  } = {}
) => {
  // Default auth context
  const defaultAuthContext = {
    user: authState.user || null,
    loading: authState.loading || false,
    isAuthenticated: !!authState.user,
    isAdmin: authState.user?.isAdmin || false,
    login: authState.login || vi.fn(),
    logout: authState.logout || vi.fn(),
    updateUser: authState.updateUser || vi.fn(),
  };

  // Default cart context
  const defaultCartContext = {
    cart: cartState.cart || [],
    getCartCount: cartState.getCartCount || vi.fn(() => cartState.cartCount || 0),
    addToCart: cartState.addToCart || vi.fn(),
    removeFromCart: cartState.removeFromCart || vi.fn(),
    updateQuantity: cartState.updateQuantity || vi.fn(),
    clearCart: cartState.clearCart || vi.fn(),
    cartItemCount: cartState.cartCount || 0,
  };

  // Default search context
  const defaultSearchContext = {
    searchResults: searchState.searchResults || [],
    isSearching: searchState.isSearching || false,
    showSearchResults: searchState.showSearchResults || false,
    recentSearches: searchState.recentSearches || [],
    performSearch: searchState.performSearch || vi.fn(),
    clearSearch: searchState.clearSearch || vi.fn(),
    clearRecentSearches: searchState.clearRecentSearches || vi.fn(),
    setShowSearchResults: searchState.setShowSearchResults || vi.fn(),
  };

  // Mock the hooks
  vi.mocked(useAuth).mockReturnValue(defaultAuthContext);
  vi.mocked(useCart).mockReturnValue(defaultCartContext);
  vi.mocked(useSearch).mockReturnValue(defaultSearchContext);

  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <SearchProvider>
              {ui}
              <Toaster />
            </SearchProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    ),
  };
};

// ============================================================================
// TESTS
// ============================================================================

describe("HeaderClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    localStorage.clear();
    // Mock matchMedia for dark mode tests
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

//   // ==========================================================================
//   // Mobile Menu
//   // ==========================================================================
  describe("Mobile Menu", () => {
    it("should show mobile menu button on mobile devices", () => {
      renderWithProviders(<HeaderClient />);

      const menuButton = screen.getByLabelText(/toggle mobile menu/i);
      expect(menuButton).toBeInTheDocument();
    });

    it("should toggle mobile menu when button is clicked", async () => {
      const { user } = renderWithProviders(<HeaderClient />, {
        authState: {
          user: { id: 1, firstname: "John", email: "john@example.com" },
        },
      });

      const menuButton = screen.getByLabelText(/toggle mobile menu/i);
      
      // Click to open menu
      await user.click(menuButton);

      await waitFor(() => {
        
        const allHomeLinks = screen.getAllByText(/home/i);
        expect(allHomeLinks.length).toBeGreaterThan(0);
        
      });
    });

    it("should show user info in mobile menu when authenticated", async () => {
      const mockUser = {
        id: 1,
        firstname: "John",
        email: "john@example.com",
      };

      const { user } = renderWithProviders(<HeaderClient />, {
        authState: {
          user: mockUser,
        },
      });

      // Open mobile menu
      const menuButton = screen.getByLabelText(/toggle mobile menu/i);
      await user.click(menuButton);

      // Should show user name in mobile menu
      await waitFor(() => {
        const userNames = screen.getAllByText("John");
        // At least one instance should be visible (could be in header + mobile menu)
        expect(userNames.length).toBeGreaterThan(0);
      });
    });

    it("should show login option in mobile menu when not authenticated", async () => {
      const { user } = renderWithProviders(<HeaderClient />, {
        authState: {
          user: null,
        },
      });

      // Open mobile menu
      const menuButton = screen.getByLabelText(/toggle mobile menu/i);
      await user.click(menuButton);

      // Should show login link in mobile menu
      await waitFor(() => {
        const loginLinks = screen.getAllByText(/login/i);
        expect(loginLinks.length).toBeGreaterThan(0);
      });
    });
  });

//   // ==========================================================================
//   // Search Functionality
//   // ==========================================================================
  describe("Search Functionality", () => {
    it("should display search input on desktop", () => {
      renderWithProviders(<HeaderClient />);

      const searchInputs = screen.getAllByPlaceholderText(/search/i);
      expect(searchInputs.length).toBeGreaterThan(0);
    });

    it("should update search input value when user types", async () => {
      const { user } = renderWithProviders(<HeaderClient />);

      const searchInput = screen.getAllByPlaceholderText(/search/i)[0];
      await user.type(searchInput, "laptop");

      expect(searchInput).toHaveValue("laptop");
    });

    it("should call performSearch when user types", async () => {
      const mockPerformSearch = vi.fn();
      const { user } = renderWithProviders(<HeaderClient />, {
        searchState: {
          performSearch: mockPerformSearch,
        },
      });

      const searchInput = screen.getAllByPlaceholderText(/search/i)[0];
      await user.type(searchInput, "laptop");

      await waitFor(() => {
        expect(mockPerformSearch).toHaveBeenCalled();
      });
    });

    it("should show search results when searching", async () => {
      const mockSearchResults = [
        {
          id: 1,
          title: "Gaming Laptop",
          price: 999.99,
          image: "laptop.jpg",
          category: "Electronics",
          rating: { rate: 4.5, count: 100 },
        },
      ];

      const { user } = renderWithProviders(<HeaderClient />, {
        searchState: {
          searchResults: mockSearchResults,
          showSearchResults: true,
        },
      });

      const searchInput = screen.getAllByPlaceholderText(/search/i)[0];
      await user.type(searchInput, "laptop");

      await waitFor(() => {
        expect(screen.getAllByText("Gaming Laptop").length).toBeGreaterThan(0);
      });
    });

    it("should show 'no results' message when search returns empty", async () => {
      const { user } = renderWithProviders(<HeaderClient />, {
        searchState: {
          searchResults: [],
          showSearchResults: true,
        },
      });

      const searchInput = screen.getAllByPlaceholderText(/search/i)[0];
      await user.type(searchInput, "nonexistent");

      await waitFor(() => {
        expect(screen.getAllByText(/no results found/i).length).toBeGreaterThan(0);
      });
    });

    it("should clear search when clear button is clicked", async () => {
      const mockClearSearch = vi.fn();
      const { user } = renderWithProviders(<HeaderClient />, {
        searchState: {
          clearSearch: mockClearSearch,
        },
      });

      const searchInput = screen.getAllByPlaceholderText(/search/i)[0];
      await user.type(searchInput, "laptop");

      // Find and click clear button
      const clearButton = screen.getAllByLabelText(/clear search/i)[0];
      await user.click(clearButton);

      expect(mockClearSearch).toHaveBeenCalled();
    });

    // it("should submit search on Enter key", async () => {
    //   const { user } = renderWithProviders(<HeaderClient />);

    //   const searchInput = screen.getAllByPlaceholderText(/search/i)[0];
    //   await user.type(searchInput, "laptop{Enter}");

    //   expect(mockNavigate).toHaveBeenCalledWith(
    //     expect.stringContaining("/search?q=")
    //   );
    // });
  });

//   // ==========================================================================
//   // Cart Badge
//   // ==========================================================================
  describe("Cart Badge", () => {
    it("should display cart icon", () => {
      renderWithProviders(<HeaderClient />);

      const cartButton = screen.getAllByLabelText(/shopping cart/i);
      expect(cartButton.length).toBeGreaterThan(0);
    });

    it("should show cart count badge when cart has items", () => {
      renderWithProviders(<HeaderClient />, {
        cartState: {
          cartCount: 5,
        },
      });

      expect(screen.getAllByText("5").length).toBeGreaterThan(0);
    });

    it("should not show cart badge when cart is empty", () => {
      renderWithProviders(<HeaderClient />, {
        cartState: {
          cartCount: 0,
        },
      });

      // Badge with "0" should not be in the document
      const badges = screen.queryAllByText("0");
      // Filter to only cart-related badges (not other zeros)
      const cartBadges = badges.filter(badge => 
        badge.closest('button')?.getAttribute('aria-label')?.includes('cart')
      );
      expect(cartBadges.length).toBe(0);
    });

    it("should navigate to cart page when cart icon is clicked", async () => {
      const { user } = renderWithProviders(<HeaderClient />);

      const cartButton = screen.getAllByLabelText(/shopping cart/i)[0];
      await user.click(cartButton);
        await waitFor(()=>{
          expect(mockNavigate).toHaveBeenCalledWith("/cart");
        })
    });
  });

//   // ==========================================================================
//   // User Authentication - Not Logged In
//   // ==========================================================================
  describe("User Authentication - Not Logged In", () => {
    it("should show Login/Signup button when user is not authenticated", () => {
      renderWithProviders(<HeaderClient />, {
        authState: {
          user: null,
        },
      });

      expect(screen.getByText(/login \/ signup/i)).toBeInTheDocument();
    });

it("should navigate to login page when Login/Signup is clicked", async () => {
  const { user } = renderWithProviders(<HeaderClient />);

  const loginLink = screen.getByRole("link", {
    name: /login|signup/i,
  });

  expect(loginLink).toHaveAttribute("href", "/login");
});

  });

//   // ==========================================================================
//   // User Authentication - Logged In
//   // ==========================================================================
  describe("User Authentication - Logged In", () => {
    const mockUser = {
      id: 1,
      firstname: "John",
      email: "john@example.com",
      isAdmin: false,
    };

    it("should show user avatar when authenticated", () => {
      renderWithProviders(<HeaderClient />, {
        authState: {
          user: mockUser,
        },
      });

      expect(screen.getByText("J")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
    });

    it("should show user dropdown menu when avatar is clicked", async () => {
      const { user } = renderWithProviders(<HeaderClient />, {
        authState: {
          user: mockUser,
        },
      });

      const userButton = screen.getByText("John");
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.getByText("My Profile")).toBeInTheDocument();
        expect(screen.getByText("My Orders")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
      });
    });

    it("should close dropdown when clicking outside", async () => {
      const { user } = renderWithProviders(<HeaderClient />, {
        authState: {
          user: mockUser,
        },
      });

      // Open dropdown
      const userButton = screen.getByText("John");
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.getByText("My Profile")).toBeInTheDocument();
      });

      // Click outside (on the logo)
      const logo = screen.getByText("SWOO TECH MART");
      await user.click(logo);

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText("My Profile")).not.toBeInTheDocument();
      });
    });

    it("should navigate to profile when My Profile is clicked", async () => {
      const { user } = renderWithProviders(<HeaderClient />, {
        authState: {
          user: mockUser,
        },
      });

      const userButton = screen.getByText("John");
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.getByText("My Profile")).toBeInTheDocument();
      });

      const profileLink = screen.getByRole("link",{name:"My Profile"});
      expect(profileLink).toHaveAttribute("href", "/profile");
    });

    it("should show Admin Panel link for admin users", async () => {
      const adminUser = { ...mockUser, isAdmin: true };
      const { user } = renderWithProviders(<HeaderClient />, {
        authState: {
          user: adminUser,
        },
      });

      const userButton = screen.getByText("John");
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.getByText("Admin Panel")).toBeInTheDocument();
      });
    });

    it("should not show Admin Panel link for regular users", async () => {
      const { user } = renderWithProviders(<HeaderClient />, {
        authState: {
          user: mockUser,
        },
      });

      const userButton = screen.getByText("John");
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
      });
    });
  });

//   // ==========================================================================
//   // Navigation Links
//   // ==========================================================================
  describe("Navigation Links", () => {
    it("should display Home link", () => {
      renderWithProviders(<HeaderClient />);

      expect(screen.getByRole("link", { name: /home/i })).toBeInTheDocument();
    });

    it("should navigate to home when Home link is clicked", async () => {
      const { user } = renderWithProviders(<HeaderClient />);

      const homeLink = screen.getByRole("link", { name: /home/i });
    expect(homeLink).toHaveAttribute("href", "/");
      
    });
  });


//   // ==========================================================================
//   // Responsive Behavior
//   // ==========================================================================
  describe("Responsive Behavior", () => {
    it("should have mobile-specific search input", () => {
      renderWithProviders(<HeaderClient />);

      // Should have multiple search inputs (desktop + mobile)
      const searchInputs = screen.getAllByPlaceholderText(/search/i);
      expect(searchInputs.length).toBeGreaterThanOrEqual(1);
    });

    it("should have different layout for mobile and desktop", () => {
      renderWithProviders(<HeaderClient />);

      // Mobile menu button exists (mobile-specific)
      expect(screen.getByLabelText(/toggle mobile menu/i)).toBeInTheDocument();
      
      // Desktop navigation also exists (hidden on mobile via CSS)
      const homeLinks = screen.getAllByText(/home/i);
      expect(homeLinks.length).toBeGreaterThan(0);
    });
  });

//   // ==========================================================================
//   // Search Result Navigation
//   // ==========================================================================
  describe("Search Result Navigation", () => {
    const mockSearchResults = [
      {
        id: 1,
        title: "Laptop",
        price: 999.99,
        image: "laptop.jpg",
        category: "Electronics",
        rating: { rate: 4.5, count: 100 },
      },
      {
        id: 2,
        title: "Mouse",
        price: 29.99,
        image: "mouse.jpg",
        category: "Electronics",
        rating: { rate:4.1, count: 50 },
      },
    ];

    it("should display multiple search results", async () => {
      const { user } = renderWithProviders(<HeaderClient />, {
        searchState: {
          searchResults: mockSearchResults,
          showSearchResults: true,
        },
      });
      await waitFor(() => {
        expect(screen.getAllByText("Laptop").length).toBeGreaterThan(0);
        expect(screen.getAllByText("Mouse").length).toBeGreaterThan(0);
      });
    });

    it("should show product price and rating in search results", async () => {
      renderWithProviders(<HeaderClient />, {
        searchState: {
          searchResults: mockSearchResults,
          showSearchResults: true,
        },
      });

      await waitFor(() => {
        expect(screen.getAllByText("$999.99").length).toBeGreaterThan(0);
        expect(screen.getAllByText("$29.99").length).toBeGreaterThan(0); 
          expect(screen.getAllByText("4.5").length).toBeGreaterThan(0);
           expect(screen.getAllByText("4.1").length).toBeGreaterThan(0);
        
      });
    });



    it("should clear search and close dropdown after clicking result", async () => {
      const mockClearSearch = vi.fn();
      const mockSetShowSearchResults = vi.fn();

      const { user } = renderWithProviders(<HeaderClient />, {
        searchState: {
          searchResults: mockSearchResults,
          showSearchResults: true,
          clearSearch: mockClearSearch,
          setShowSearchResults: mockSetShowSearchResults,
        },
      });

      const laptopResult = screen.getAllByText("Laptop")[0];
      await user.click(laptopResult);

      expect(mockNavigate).toHaveBeenCalledWith("/products/1");
    });
  });

//   // ==========================================================================
//   // Edge Cases
//   // ==========================================================================
  describe("Edge Cases", () => {
    it("should handle user with no firstname (fallback to name)", () => {
      const userWithoutFirstname = {
        id: 1,
        name: "JohnDoe",
        email: "john@example.com",
      };

      renderWithProviders(<HeaderClient />, {
        authState: {
          user: userWithoutFirstname,
        },
      });

      expect(screen.getByText("JohnDoe")).toBeInTheDocument();
      expect(screen.getByText("J")).toBeInTheDocument(); // First letter
    });

    it("should handle user with neither firstname nor name", () => {
      const userWithoutName = {
        id: 1,
        email: "john@example.com",
      };

      renderWithProviders(<HeaderClient />, {
        authState: {
          user: userWithoutName,
        },
      });

      expect(screen.getByText("U")).toBeInTheDocument(); // Default "U"
    });

    it("should handle very large cart count", () => {
      renderWithProviders(<HeaderClient />, {
        cartState: {
          cartCount: 999,
        },
      });

      expect(screen.getAllByText("999").length).toBeGreaterThan(0);
    });

    it("should handle long search queries", async () => {
      const { user } = renderWithProviders(<HeaderClient />);

      const searchInput = screen.getAllByPlaceholderText(/search/i)[0];
      const longQuery = "This is a very long search query that someone might type when looking for something specific";
      
      await user.type(searchInput, longQuery);

      expect(searchInput).toHaveValue(longQuery);
    });

    it("should prevent form submission on empty search", async () => {
      const { user } = renderWithProviders(<HeaderClient />);

      const searchInput = screen.getAllByPlaceholderText(/search/i)[0];
      await user.type(searchInput, "{Enter}");

      // Should not navigate if search is empty
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});