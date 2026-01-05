import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import ProductCard from "../../components_temp/ProductCard";

/* ------------------------------------------------------------------ */
/* MOCKS */
/* ------------------------------------------------------------------ */

// mock navigate
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// mock toast
vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// cart mocks
const mockAddToCart = vi.fn();
const mockIsInCart = vi.fn();
const mockGetCartItemQuantity = vi.fn();

vi.mock("../../contexts/CartContext", () => ({
  useCart: () => ({
    addToCart: mockAddToCart,
    isInCart: mockIsInCart,
    getCartItemQuantity: mockGetCartItemQuantity,
    isSyncing: false,
  }),
}));

// auth mock
vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Test User" },
  }),
}));

/* ------------------------------------------------------------------ */
/* TEST DATA */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/* HELPER */
/* ------------------------------------------------------------------ */

const renderCard = (props = {}) => {
  return {
    user: userEvent.setup(),
    ...render(
      <BrowserRouter>
        <ProductCard product={mockProduct} {...props} />
      </BrowserRouter>
    ),
  };
};

/* ------------------------------------------------------------------ */
/* TESTS */
/* ------------------------------------------------------------------ */

describe("ProductCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockIsInCart.mockReturnValue(false);
    mockGetCartItemQuantity.mockReturnValue(0);

    mockNavigate.mockClear();
    window.scrollTo = vi.fn();
  });

  /* -------------------------------------------------- */
  /* LOADING STATE */
  /* -------------------------------------------------- */

  it("renders loading skeleton when isLoading is true", () => {
    renderCard({ isLoading: true });

    expect(
      screen.queryByText("Test Product")
    ).not.toBeInTheDocument();
  });

  /* -------------------------------------------------- */
  /* BASIC RENDERING */
  /* -------------------------------------------------- */

  it("renders product information correctly", () => {
    renderCard();

    expect(screen.getByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("ELECTRONICS")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
    expect(screen.getByText("4.3")).toBeInTheDocument();
    expect(screen.getByText("(120)")).toBeInTheDocument();
  });

  /* -------------------------------------------------- */
  /* NAVIGATION */
  /* -------------------------------------------------- */

  it("navigates to product detail page when card is clicked", async () => {
    const { user } = renderCard();

    await user.click(screen.getByText("Test Product"));

    expect(mockNavigate).toHaveBeenCalledWith("/products/1");
  });

  it("navigates to product detail page when Quick View is clicked", async () => {
    const { user } = renderCard();

    await user.click(screen.getByText(/quick view/i));

    expect(mockNavigate).toHaveBeenCalledWith("/products/1");
  });

  /* -------------------------------------------------- */
  /* ADD TO CART */
  /* -------------------------------------------------- */

  it("calls addToCart when Add to Cart button is clicked", async () => {
    mockAddToCart.mockResolvedValueOnce();

    const { user } = renderCard();

    await user.click(screen.getByText(/add to cart/i));

    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct, 1);
  });

  it("shows adding state while addToCart is in progress", async () => {
    mockAddToCart.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { user } = renderCard();

    await user.click(screen.getByText(/add to cart/i));

    expect(screen.getByText(/adding/i)).toBeInTheDocument();
  });

  it("disables Add to Cart button if product is already in cart", () => {
    mockIsInCart.mockReturnValue(true);
    mockGetCartItemQuantity.mockReturnValue(2);

    renderCard();

    expect(screen.getByText(/In Cart/i)).toBeInTheDocument();
    expect(screen.getByRole("button",{name: /added to cart/i})).toBeDisabled();
  });

  /* -------------------------------------------------- */
  /* CART STATUS BADGE */
  /* -------------------------------------------------- */

  it("shows In Cart badge with quantity", () => {
    mockIsInCart.mockReturnValue(true);
    mockGetCartItemQuantity.mockReturnValue(3);

    renderCard();

    expect(
      screen.getByText(/in cart \(3\)/i)
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------- */
  /* ERROR HANDLING */
  /* -------------------------------------------------- */

  it("does not crash when addToCart fails", async () => {
    mockAddToCart.mockRejectedValueOnce(new Error("Failed"));

    const { user } = renderCard();

    await user.click(screen.getByText(/add to cart/i));

    await waitFor(() => {
      expect(
        screen.getByText(/add to cart/i)
      ).toBeInTheDocument();
    });
  });

  /* -------------------------------------------------- */
  /* SYNC STATUS */
  /* -------------------------------------------------- */

  it("shows synced message when user and item is in cart", () => {
    mockIsInCart.mockReturnValue(true);
    mockGetCartItemQuantity.mockReturnValue(1);

    renderCard();

    expect(
      screen.getByText(/synced to server/i)
    ).toBeInTheDocument();
  });
});
