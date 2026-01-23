import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import HeaderClient from "../../components_temp/HeaderClient";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useSearch } from "../../contexts/SearchContext";

// Mock useAuth hook
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));
// Mock useCart hook
vi.mock("../../contexts/CartContext", () => ({
  useCart: vi.fn(),
}));

// Mock useSearch hook
vi.mock("../../contexts/SearchContext", () => ({
  useSearch: vi.fn(),
}));

// Mock react-hot-toast to prevent toast errors
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
  },
}));
// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const renderComponent = () =>
  render(
    <BrowserRouter>
      <HeaderClient />
    </BrowserRouter>
  );

// // Mock search context with default values
const mockSearch = () => {
  useSearch.mockReturnValue({
    searchResults: [],
    isSearching: false,
    showSearchResults: false,
    recentSearches: [],
    performSearch: vi.fn(),
    clearSearch: vi.fn(),
    clearRecentSearches: vi.fn(),
    setShowSearchResults: vi.fn(),
  });
};

// Mock cart with count
const mockCart = (count = 8) => {
  useCart.mockReturnValue({
    getCartCount: vi.fn().mockReturnValue(count),
  });
};

// Mock unauthenticated user
const mockUnauthenticatedUser = () => {
  useAuth.mockReturnValue({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    logout: vi.fn(),
  });
};

// Mock authenticated user
const mockAuthenticatedUser = (name) => {
  useAuth.mockReturnValue({
    user: {
      id: "123",
      name: "John Doe",
      firstname: "John",
      email: "john@example.com",
    },
    isAuthenticated: true,
    isAdmin: true,
    logout: vi.fn(),
  });

};

// ============================================================================
// TESTS
// ============================================================================

describe("HeaderClient", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch(); // Always mock search
    mockCart(0); // Always mock cart
  });

  describe("Mobile View", () => {
    it("Mobile Menu Component Check when not authenticated", async() => {
      mockUnauthenticatedUser();
      renderComponent();
     
      const mobileMenu =screen.getByTestId('toggle-mobile-menu');
      expect(mobileMenu).toBeInTheDocument();
      // expect(screen.getByTestId('toggle-mobile-menu')).toBeInTheDocument();
       await user.click(mobileMenu);
        await waitFor(() => {
       const home = screen.getByTestId('mobile-menu-home');
       expect(home).toBeInTheDocument();
     
      const login = screen.getByTestId('mobile-menu-login');
       expect(login).toBeInTheDocument();
        expect(screen.queryByTestId('toggle-mobile-setting')).not.toBeInTheDocument();
       });
    })

    it("should show user info in mobile menu when authenticated", async () => {
          mockAuthenticatedUser();
       renderComponent();

      // Open mobile menu
      const menuButton = screen.getByTestId(/toggle-mobile-menu/i);
      await user.click(menuButton);

      // Should show user name in mobile menu
      await waitFor(() => {
        const userNames = screen.getByTestId("mobile-menu-username");
        expect(userNames).toHaveTextContent("John");
      });
      expect(screen.getByTestId("mobile-menu-logout")).toBeInTheDocument();
       expect(screen.getByTestId("mobile-menu-admin-panel")).toBeInTheDocument();
        expect(screen.getByTestId("mobile-menu-profile")).toBeInTheDocument();
    });

  });




  //   // ==========================================================================
  //   // Search Functionality
  //   // ==========================================================================
  describe("Search Functionality", () => {

    it("Testing search Input Fucntionality", async() => {
      renderComponent();

      const searchInputs = screen.getByTestId("search-input");
      expect(searchInputs).toBeInTheDocument();
      expect(searchInputs).toHaveAttribute("type", "text");
         
       await user.type(searchInputs, "laptop");
       expect(searchInputs).toHaveValue("laptop");
    });

    it("should call performSearch when user types", async () => {
      renderComponent();

      expect(screen.queryByTestId("clear-search-button")).not.toBeInTheDocument();
      const searchInput = screen.getByTestId("search-input");
      await user.type(searchInput, "mens");
      await waitFor(() => {
        expect(useSearch().performSearch).toHaveBeenCalledWith("mens");
        expect(screen.getByTestId("search-input")).toHaveValue("mens");
      });
    });
  });

  //   // ==========================================================================
  //   // Cart Badge
  //   // ==========================================================================
  describe("Cart Count in the Header", () => {
    it("should display cart Count When cart count is greater than 0", () => {
      mockCart(6);
      renderComponent();
      // mockCart(6);//this should be rendered first before rendering the componetn so it is loaded in the state
      const cartButton = screen.getByTestId("cart-button");
      expect(cartButton).toBeInTheDocument();
      expect(cartButton).toHaveAttribute("aria-label");
      const cartCount = screen.getByTestId("cart-count");
      expect(cartCount).toBeInTheDocument();
      expect(cartCount).toHaveTextContent("6");
        });
    it("should't display cart Count When cart count is 0", () => {
      mockCart(0);
      renderComponent();
      // mockCart(6);//this should be rendered first before rendering the componetn so it is loaded in the state
      const cartButton = screen.getByTestId("cart-button");
      expect(cartButton).toBeInTheDocument();
      expect(cartButton).toHaveAttribute("aria-label");
      const cartCount = screen.queryByTestId("cart-count");
      expect(cartCount).not.toBeInTheDocument();
      // expect(cartCount).not.toHaveTextContent("0");//as it will nont show the 0 in the count because cart is empty only shows cart count when some item is added in the cart.
    });
  });

  describe("Login / Signup or User Info", () => {
    it("should show Login/Signup button when user is not authenticated", () => {
      mockUnauthenticatedUser();
      renderComponent();

      expect(screen.getByText(/login \/ signup/i)).toBeInTheDocument();
      const loginLink = screen.getByRole("link", {
        name: /login|signup/i,
      });
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("should show user avatar & Dropdown when authenticated", async() => {
            mockAuthenticatedUser();
            renderComponent();

      expect(screen.getByText("J")).toBeInTheDocument();
      expect(screen.getByText("John")).toBeInTheDocument();
            const userButton = screen.getByTestId("user-button");
          await user.click(userButton);

              await waitFor(() => {
        expect(screen.getByText("My Profile")).toBeInTheDocument();
        expect(screen.getByText("My Orders")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
        expect(screen.getByText("Admin Panel")).toBeInTheDocument();
        expect(screen.getByText("Logout")).toBeInTheDocument();
        expect(screen.getAllByText("Admin").length).toBeGreaterThan(0);
      });
      });

    it("should close dropdown when clicking outside", async () => {
      mockAuthenticatedUser();
              renderComponent();
      // Open dropdown
      const userButton = screen.getByTestId("user-button");
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
  })
});
