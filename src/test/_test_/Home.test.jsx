import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import EcommerceHomepage from "../../pages/client/Home";
import { AuthProvider } from "../../contexts/AuthContext";
import { CartProvider } from "../../contexts/CartContext";

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



const mockProducts = Array.from({ length: 20 }).map(( _, i) => ({
  id: i + 1,
  title: `Product ${i + 1}`,
  category: i % 2 === 0 ? "electronics" : "clothing",
  price: 99,
}));

const mockCategories = ["electronics", "clothing"];


const renderComponent = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
      <EcommerceHomepage />
      </AuthProvider>
    </BrowserRouter>
  );


describe("EcommerceHomepage", () => {
        beforeEach(() => {
          const user = userEvent.setup();
          vi.clearAllMocks();
          mockGetAll.mockResolvedValue({ data: mockProducts });
         mockGetCategories.mockResolvedValue({ data: mockCategories });

           vi.spyOn(console, "error").mockImplementation(() => {});
             });
           afterEach(() => {
              vi.restoreAllMocks();
                });

describe("Details of products", () => {
            

  it("shows loading state initially", async () => {
   renderComponent();
      expect( await screen.getByText(/loading amazing products/i)).toBeInTheDocument(); 
     });

    it("shows error state when API fails", async () => {
    mockGetAll.mockRejectedValueOnce(new Error("API Error"));
    renderComponent();
    await waitFor(() => {
      expect( screen.getByText(/oops! something went wrong/i)).toBeInTheDocument();
    });
  });

  it("renders products after successful load but only 12 initially", async () => {
       renderComponent();

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card").length).toBe(12);//to shows that we loaded only 12 products and more can be loaded after clicking the load more button
    });
    expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 12")).toBeInTheDocument();
        });

  it("renders category buttons here after successful load", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
      expect(screen.getByText("Clothing")).toBeInTheDocument();
    });
  });

  it("filters products by category", async () => {
     const user = userEvent.setup();
    renderComponent();

    await waitFor(() =>
      expect(screen.getAllByTestId("product-card").length).toBe(12)
    );
      const cards = screen.getAllByTestId("product-card");
      expect(cards.length).toBeGreaterThan(8);

    await user.click(screen.getByText("Electronics"));

    await waitFor(() => {
      const cards = screen.getAllByTestId("product-card");
      expect(cards.length).toBeGreaterThan(8);
    });
  });

  it("loads more products when clicking Load More", async () => {
    renderComponent();
     const user = userEvent.setup();

    await waitFor(() =>
      expect(screen.getAllByTestId("product-card").length).toBe(12)
    );
    await user.click(screen.getByText(/load more products/i));
    await waitFor(() =>
      expect(screen.getAllByTestId("product-card").length).toBe(18)
    );
  });
});

  /* -------------------------------------------------- */
  /* HERO CAROUSEL */
  /* -------------------------------------------------- */

 describe("Hero Carousel", () => {
    it("changes slide when next button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText("New Collection 2026")).toBeInTheDocument();
    });

    // Get the initial slide title text
    const initialTitle = screen.getAllByRole("heading", { level: 2 })[0].textContent;
    expect(initialTitle).toBe("New Collection 2026");

    // Click next button
    const nextButton = screen.getByLabelText(/next slide/i);
    await user.click(nextButton);

    // Wait for the slide transition to complete (700ms + buffer)
    // The carousel has a 700ms CSS transition, so we need to wait for it
    await new Promise(resolve => setTimeout(resolve, 800));

    // Now check that the title has changed
    await waitFor(() => {
      const headings = screen.getAllByRole("heading", { level: 2 });
      // Find the visible heading (the one with opacity-100)
      const visibleHeading = headings.find(heading => {
        const slideDiv = heading.closest('[class*="opacity-100"]');
        return slideDiv !== null;
      });
      
      if (visibleHeading) {
        expect(visibleHeading.textContent).not.toBe(initialTitle);
      }
    }, { timeout: 2000 });

    // Verify the new title is one of the expected slides
    const allHeadings = screen.getAllByRole("heading", { level: 2 });
    const titles = allHeadings.map(h => h.textContent);
    expect(titles).toContain("Smart Home Devices");
  });

  it("changes slide when indicator is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();

    const indicators = screen.getAllByLabelText(/go to slide/i);
    user.click(indicators[2]);

    expect(screen.getByText(/smart home devices/i)).toBeInTheDocument();
  });


  it("Shop Now button takes user to products page", async () => {
    const user = userEvent.setup();
    renderComponent();
  const shopNow=screen.getAllByTestId("shop-now-button")[0];
  await user.click(shopNow);
  await waitFor(() => {
    expect(window.location.pathname).toBe("/product");
  });
 });

  });
});