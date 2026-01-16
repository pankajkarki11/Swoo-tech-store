// tests/CartDetails.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CartDetails from "../../../pages/admin/CartDetails";

// ============================================================================
// MOCKS
// ============================================================================

const mockNavigate = vi.fn();

// Mock useToast
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};
vi.mock("../../contexts/ToastContext", () => ({
  useToast: () => mockToast,
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
    useNavigate: () => mockNavigate,
    useOutletContext: () => ({ toast: mockToast }),
  };
});

const mockCartAPI = {
  getById: vi.fn(),
};

const mockUserAPI = {
  getById: vi.fn(),
};

const mockProductAPI = {
  getById: vi.fn(),
};

vi.mock("../../../services/AdminuseApi", () => ({
  default: vi.fn(() => ({
    cartAPI: mockCartAPI,
    userAPI: mockUserAPI,
    productAPI: mockProductAPI,
  })),
}));

// ============================================================================
// MOCK DATA
// ============================================================================

const mockCart = {
  id: 1,
  userId: 1,
  date: "2024-01-15T10:00:00.000Z",
  products: [
    { productId: 1, quantity: 2 },
    { productId: 2, quantity: 1 },
  ],
};

const mockUser = {
  id: 1,
  name: { firstname: "John", lastname: "Doe" },
  email: "john@example.com",
  phone: "+1 (555) 123-4567",
  address: {
    street: "123 Main St",
    city: "New York",
    zipcode: "10001",
  },
};

const mockProduct1 = {
  id: 1,
  title: "Gaming Laptop",
  price: 999.99,
  category: "electronics",
  image: "laptop.jpg",
};

const mockProduct2 = {
  id: 2,
  title: "tshirt",
  price: 29.99,
  category: "mens",
  image: "tshirt.jpg",
};

// ============================================================================
// HELPER
// ============================================================================

const renderCartDetails = () => {
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <CartDetails />
      </BrowserRouter>
    ),
  };
};

// ============================================================================
// TESTS
// ============================================================================

describe("CartDetails", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();

    mockCartAPI.getById.mockResolvedValue({ data: mockCart });
    mockUserAPI.getById.mockResolvedValue({ data: mockUser });
    mockProductAPI.getById
      .mockResolvedValueOnce({ data: mockProduct1 })
      .mockResolvedValueOnce({ data: mockProduct2 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ==========================================================================
  // Initial Render & Data Fetching
  // ==========================================================================
  describe("Initial Render & Data Fetching", () => {
    it("should show loading spinner while fetching", () => {
      mockCartAPI.getById.mockImplementation(() => new Promise(() => {}));
      renderCartDetails();

      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
      expect(screen.getByText("Loading cart details...")).toBeInTheDocument();
    });

    it("should fetch cart, user, and product details on mount", async () => {
      renderCartDetails();
      await waitFor(() => {
        expect(mockUserAPI.getById).toHaveBeenCalledWith(1);
        expect(mockProductAPI.getById).toHaveBeenCalledWith(1);
        expect(mockProductAPI.getById).toHaveBeenCalledWith(2);
      });
    });

    it("should display cart UI elements after loading", async () => {
      renderCartDetails();

      await waitFor(() => {
        expect(screen.getByTestId("cart-header")).toBeInTheDocument();//header section of the cart detail page
        expect(screen.getByText("Cart #1")).toBeInTheDocument();//cart id
        expect(screen.getByTestId("process-order-button")).toBeInTheDocument();
        expect(screen.getByTestId("back-button")).toBeInTheDocument();
        expect(screen.getByTestId("cart-table")).toBeInTheDocument();//all the details of carts such as products ,quantity,price
        expect(screen.getAllByTestId("remove-item-button").length ).toBeGreaterThan(0);//there are multiple remove buttons
        expect(screen.getByTestId("order-summary-card")).toBeInTheDocument();//it summarize the order
        expect(screen.getByTestId("checkout-button")).toBeInTheDocument();
        expect(screen.getByTestId("cart-info-card")).toBeInTheDocument();//shows information about the cart
        expect(screen.getByTestId("customer-info-card")).toBeInTheDocument();//shows custoemr details card
        expect(screen.getByTestId("view-customer-button")).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Cart Information Display
  // ==========================================================================
  describe("Cart Information Display", () => {
    it("should display cart ID", async () => {
      renderCartDetails();

      await waitFor(() => {
        expect(screen.getByText("Cart #1")).toBeInTheDocument();
      });
    });

    it("should display cart date", async () => {
      renderCartDetails();

      await waitFor(() => {
        // Date should be formatted
        expect(screen.getByText(/January 15, 2024/i)).toBeInTheDocument();
      });
    });

    it("should display cart status badge", async () => {
      renderCartDetails();

      await waitFor(() => {
        // High value badge for total > 500
        expect(screen.getByText("High Value")).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Cart Items Display
  // ==========================================================================
  describe("Cart Items Display", () => {
    it("should display cart items count", async () => {
      renderCartDetails();

      await waitFor(() => {
        expect(screen.getByText("Cart Items (2)")).toBeInTheDocument();
      });
    });

    it("should display product details in table", async () => {
      renderCartDetails();

      await waitFor(() => {
        expect(screen.getByText("Gaming Laptop")).toBeInTheDocument();
        expect(screen.getByText("tshirt")).toBeInTheDocument();
        expect(screen.getByText("electronics")).toBeInTheDocument();
      });
    });

    it("should display product quantities", async () => {
      renderCartDetails();

      await waitFor(() => {
        expect(screen.getByText("1")).toBeInTheDocument();
      });
    });

    it("should display product prices", async () => {
      renderCartDetails();

      await waitFor(() => {
        expect(screen.getByText("$999.99")).toBeInTheDocument();
        expect(screen.getAllByText("$29.99").length).toBeGreaterThan(0);
      });
    });

    it("should calculate item totals correctly", async () => {
      renderCartDetails();

      // Laptop: 999.99 * 2 = 1999.98
      // Mouse: 29.99 * 1 = 29.99
      await waitFor(() => {
        expect(screen.getByText("$1999.98")).toBeInTheDocument();
      });
    });

    it("should show empty state when cart has no items", async () => {
      const emptyCart = { ...mockCart, products: [] };
      mockCartAPI.getById.mockResolvedValue({ data: emptyCart });

      renderCartDetails();

      await waitFor(() => {
        expect(screen.getByText("Cart is empty")).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // Order Summary Calculations
  // ==========================================================================
  describe("Order Summary Calculations", () => {
    it("should calculate subtotal correctly", async () => {
      renderCartDetails();

      // Subtotal: 1999.98 + 29.99 = 2029.97
      await waitFor(() => {
        const subtotalElement = screen.getByTestId("order-summary-card");
        expect(subtotalElement).toBeInTheDocument();
        expect(subtotalElement).toHaveTextContent("Subtotal");
        expect(subtotalElement).toHaveTextContent("$2029.97");
        expect(subtotalElement).toHaveTextContent("Total");
      });
    });

    it("should calculate shipping cost", async () => {
      renderCartDetails();

      // Shipping is $5.99
      await waitFor(() => {
        expect(screen.getByText("Shipping")).toBeInTheDocument();
        expect(screen.getByText("$5.99")).toBeInTheDocument();
      });
    });

    it("should calculate tax correctly", async () => {
      renderCartDetails();

      // Tax: 2029.97 * 0.08 = 162.40
      await waitFor(() => {
        expect(screen.getByText("Tax (8%)")).toBeInTheDocument();
        expect(screen.getByText("$162.40")).toBeInTheDocument();
      });
    });

    it("should calculate total correctly", async () => {
      renderCartDetails();

      // Total: 2029.97 + 5.99 + 162.40 = 2198.36
      await waitFor(() => {

        const totalAmount=screen.getByTestId("total-amount");
        expect(totalAmount).toBeInTheDocument();
        expect(totalAmount).toHaveTextContent("Total");
        expect(totalAmount).toHaveTextContent("$2198.36");
    
      });
    });

    it("should show zero shipping for empty cart", async () => {
      const emptyCart = { ...mockCart, products: [] };
      mockCartAPI.getById.mockResolvedValue({ data: emptyCart });

      renderCartDetails();

      await waitFor(() => {
        const shippingFee= screen.getByTestId("shipping-fee");
        expect(shippingFee).toBeInTheDocument();
        expect(shippingFee).toHaveTextContent("Shipping");
        expect(shippingFee).toHaveTextContent("$0.00");
      });
    });
  });

  // ==========================================================================
  // Customer Information
  // ==========================================================================
  describe("Customer Information", () => {
    it("should display customer details", async () => {
      renderCartDetails();

      await waitFor(() => {
        expect(screen.getByText("John Doe")).toBeInTheDocument();
        expect(screen.getByText("john@example.com")).toBeInTheDocument();
        expect(screen.getByText("+1 (555) 123-4567")).toBeInTheDocument();
        expect(screen.getByText(/123 Main St, New York/i)).toBeInTheDocument();
        expect(screen.getByText("JD")).toBeInTheDocument();
      });
    });

    it("should handle user fetch failure gracefully", async () => {
      mockUserAPI.getById.mockRejectedValue(new Error("User Error"));

      renderCartDetails();

      await waitFor(() => {
        // Should show placeholder user data
        const userInfo = screen.getByTestId("customer-info-card");
        expect(userInfo).toBeInTheDocument();
        expect(userInfo).toHaveTextContent("User");//it shows user when werre there is an error while fetching user data.
        expect(userInfo).not.toHaveTextContent("John Doe");
        expect(userInfo).not.toHaveTextContent("john@example.com");
      });
    });

    it("should show empty state when user not available", async () => {
      mockUserAPI.getById.mockResolvedValue({ data: null });

      renderCartDetails();

      await waitFor(() => {
         const userInfo = screen.getByTestId("customer-info-card");
        expect(userInfo).toBeInTheDocument();
        expect(userInfo).toHaveTextContent(/customer information not available/i);
      });
    });
  });

  // ==========================================================================
  // Navigation
  // ==========================================================================
  describe("Navigation", () => {
    it("should navigate back to carts page", async () => {
      const { user } = renderCartDetails();

      await waitFor(() => {
        expect(screen.getByTestId("back-button")).toBeInTheDocument();
      });

      const backButton = screen.getByTestId("back-button");
      await user.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith("/admin/carts");
    });

    it("should navigate to customer profile", async () => {
      const { user } = renderCartDetails();

      await waitFor(() => {
         const userInfo = screen.getByTestId("customer-info-card");
        expect(userInfo).toBeInTheDocument();
        expect(userInfo).toHaveTextContent("john@example.com").toBeInTheDocument();
      });
      const profileLink = screen
        .getByText("View Customer Profile")
        .closest("a");
      expect(profileLink).toHaveAttribute("href", "/admin/users/1");
    });
  });
 
  // ==========================================================================
  // Status Badge Logic
  // ==========================================================================
  describe("Status Badge Logic", () => {
    it("should show Empty badge for empty cart", async () => {
      const emptyCart = { ...mockCart, products: [] };
      mockCartAPI.getById.mockResolvedValue({ data: emptyCart });

      renderCartDetails();

      await waitFor(() => {
        expect(screen.getByText("Empty")).toBeInTheDocument();//as we have one mock cart which is empty
      });
    });

    it("should show High Value badge for total > $500", async () => {
      renderCartDetails();

      // Total is > $500
      await waitFor(() => {
        expect(screen.getByText("High Value")).toBeInTheDocument();//as we have one mock cart which has total > $100 which is considered as high value.
      });
    });
  });
});
