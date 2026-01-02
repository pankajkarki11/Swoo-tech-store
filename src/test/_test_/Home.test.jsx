// tests/EcommerceHomepage.test.jsx
import { describe,page, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import EcommerceHomepage from "../../pages/client/Home";

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

// mock API hook
const mockGetAll = vi.fn();
const mockGetCategories = vi.fn();

vi.mock("../../services/AdminuseApi", () => ({
  default: vi.fn(() => ({
    productAPI: {
      getAll: mockGetAll,
      getCategories: mockGetCategories,
    },
  })),
}));

// mock ProductCard (important)
vi.mock("../../components_temp/ProductCard", () => ({
  default: ({ product }) => (
    <div data-testid="product-card">{product.title}</div>
  ),
}));

// mock Button (simplify)
vi.mock("../../components_temp/ui/Button", () => ({
  default: ({ children, onClick, disabled, loading }) => (
    <button disabled={disabled} onClick={onClick}>
      {loading ? "Loading..." : children}
    </button>
  ),
}));

/* ------------------------------------------------------------------ */
/* TEST DATA */
/* ------------------------------------------------------------------ */

const mockProducts = Array.from({ length: 20 }).map(( _, i) => ({
  id: i + 1,
  title: `Product ${i + 1}`,
  category: i % 2 === 0 ? "electronics" : "clothing",
  price: 99,
}));

const mockCategories = ["electronics", "clothing"];

/* ------------------------------------------------------------------ */
/* HELPERS */
/* ------------------------------------------------------------------ */

const renderPage = async () => {
  const user = userEvent.setup();

  render(
    <BrowserRouter>
      <EcommerceHomepage />
    </BrowserRouter>
  );

  return { user };
};

/* ------------------------------------------------------------------ */
/* TESTS */
/* ------------------------------------------------------------------ */

describe("EcommerceHomepage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAll.mockResolvedValue({ data: mockProducts });
    mockGetCategories.mockResolvedValue({ data: mockCategories });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });


  /* -------------------------------------------------- */
  /* LOADING + ERROR STATES */
  /* -------------------------------------------------- */

  it("shows loading state initially", async () => {
    render(
      <BrowserRouter>
        <EcommerceHomepage />
      </BrowserRouter>
    );

    expect(
      screen.getByText(/loading amazing products/i)
    ).toBeInTheDocument();
  });

  it("shows error state when API fails", async () => {
    mockGetAll.mockRejectedValueOnce(new Error("API Error"));

    render(
      <BrowserRouter>
        <EcommerceHomepage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText(/oops! something went wrong/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/failed to load data/i)
    ).toBeInTheDocument();
  });

  /* -------------------------------------------------- */
  /* SUCCESS STATE */
  /* -------------------------------------------------- */

  it("renders products after successful load", async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card").length).toBe(12);
    });

    expect(screen.getByText("Product 1")).toBeInTheDocument();
  });

  it("renders category buttons", async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Clothing")).toBeInTheDocument();
    });
  });

  /* -------------------------------------------------- */
  /* CATEGORY FILTERING */
  /* -------------------------------------------------- */

  it("filters products by category", async () => {
    const { user } = await renderPage();

    await waitFor(() =>
      expect(screen.getAllByTestId("product-card").length).toBe(12)
    );

    await user.click(screen.getByText("Electronics"));

    await waitFor(() => {
      const cards = screen.getAllByTestId("product-card");
      expect(cards.length).toBeGreaterThan(0);
      expect(cards[0]).toHaveTextContent("Product");
    });
  });

  /* -------------------------------------------------- */
  /* LOAD MORE */
  /* -------------------------------------------------- */

  it("loads more products when clicking Load More", async () => {
    const { user } = await renderPage();

    await waitFor(() =>
      expect(screen.getAllByTestId("product-card").length).toBe(12)
    );

    await user.click(screen.getByText(/load more products/i));

    await waitFor(() =>
      expect(screen.getAllByTestId("product-card").length).toBe(18)
    );
  });

  /* -------------------------------------------------- */
  /* HERO CAROUSEL */
  /* -------------------------------------------------- */

  it("changes slide when next button is clicked", async () => {
    await renderPage();

    const nextButton = screen.getByLabelText(/next slide/i);
    fireEvent.click(nextButton);

    // slide title should change
    expect(
      screen.getByText(/smart home devices/i)
    ).toBeInTheDocument();
  });

  it("changes slide when indicator is clicked", async () => {
    await renderPage();

    const indicators = screen.getAllByLabelText(/go to slide/i);
    fireEvent.click(indicators[2]);

    expect(screen.getByText(/summer sale/i)).toBeInTheDocument();
  });

  /* -------------------------------------------------- */
  /* NAVIGATION */
  /* -------------------------------------------------- */

  it("navigates to product page when Shop Now is clicked", async () => {
    const { user } = await renderPage();

    const shopNowButton = screen.getAllByText(/shop now/i)[0];
    await user.click(shopNowButton);

    expect(mockNavigate).toHaveBeenCalledWith("/product");
  });

  it("navigates to subscribe page when Subscribe is clicked", async () => {
    const { user } = await renderPage();

    const subscribeButton = screen.getByRole("button",{name:/subscribe/i});
    await user.click(subscribeButton);

    // Link navigation handled by router
    expect(subscribeButton.closest("a")).toHaveAttribute(
      "href",
      "/subscribe"
    );
  });

});