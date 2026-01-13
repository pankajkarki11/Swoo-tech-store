import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientLogin from "../../pages/client/ClientLogin";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import { vi, describe, it, afterEach, expect, beforeEach,} from "vitest";


const renderComponent = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <ClientLogin />
      </AuthProvider>
    </BrowserRouter>
  );

describe("ClientLogin Component", () => {

  it("renders login page", () => {
    renderComponent();

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your username/i)
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/enter your password/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  }); 

  it("allows user to type username and password", async () => {
    renderComponent();
    const user = userEvent.setup();

    const usernameInput = screen.getByPlaceholderText(/enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i);

    await user.type(usernameInput, "johnd");
    await user.type(passwordInput, "123456");

    expect(usernameInput).toHaveValue("johnd");
    expect(passwordInput).toHaveValue("123456");
  });

  
  // it("calls login and navigate on successful login", async () => {
  //   // Mock successful login response
  //   mockLogin.mockResolvedValueOnce({ 
  //     success: true,
  //     user: { id: 1, username: "johnd" },
  //     token: "mock-token"
  //   });
    
  //   renderComponent();

  //   const user = userEvent.setup();

  //   // Type credentials
  //   await user.type(
  //     screen.getByPlaceholderText(/enter your username/i),
  //     "johnd"
  //   );
  //   await user.type(
  //     screen.getByPlaceholderText(/enter your password/i),
  //     "m38rmF$"
  //   );

  //   // Click sign in button
  //   const signInButton = screen.getByRole("button", { name: /sign in/i });
  //   await user.click(signInButton);

  //   // Wait for login to be called
  //   await waitFor(() => {
  //     expect(mockLogin).toHaveBeenCalledWith({
  //       username: "johnd",
  //       password: "m38rmF$",
  //     });
  //   });

  //   // Wait for navigation
  //   await waitFor(
  //     () => {
  //       expect(mockNavigate).toHaveBeenCalledWith("/");
  //     },
  //     { timeout: 3000 }
  //   );
  // });

  // it("shows error message on failed login", async () => {
  //   // Mock failed login
  //   mockLogin.mockResolvedValueOnce({ 
  //     success: false,
  //     error: "Wrong username or password"
  //   });

  //   renderComponent();
  //   const user = userEvent.setup();

  //   await user.type(
  //     screen.getByPlaceholderText(/enter your username/i),
  //     "wronguser"
  //   );
  //   await user.type(
  //     screen.getByPlaceholderText(/enter your password/i),
  //     "wrongpass"
  //   );

  //   await user.click(screen.getByRole("button", { name: /sign in/i }));

  //   // Wait for error message to appear
  //   await waitFor(() => {
  //     expect(
  //       screen.getByText(/wrong username or password/i)
  //     ).toBeInTheDocument();
  //   }, { timeout: 3000 });
  // });

  
  // it("Demo Account fills credentials when clicked", async () => {
  //   renderComponent();
  //   const user = userEvent.setup();

    
  //   const johnDoeElements = screen.getAllByText(/john doe/i);
    
    
  //   const johnDoeButton =
  //     johnDoeElements.find(
  //       (el) => el.tagName === "BUTTON" || el.closest("button")
  //     ) || johnDoeElements[0];
    
  //   await user.click(johnDoeButton);

   
  //   await waitFor(() => {
  //     expect(screen.getByPlaceholderText(/enter your username/i)).toHaveValue(
  //       "johnd"
  //     );
  //   });

  //   await waitFor(() => {
  //     expect(screen.getByPlaceholderText(/enter your password/i)).toHaveValue(
  //       "m38rmF$"
  //     );
  //   });
  // });
});