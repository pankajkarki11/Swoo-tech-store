import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ClientLogin from "../../pages/client/ClientLogin";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../contexts/AuthContext";
import { vi, describe, it, afterEach, expect, beforeEach,first} from "vitest";


const renderComponent = () =>
  render(
    <BrowserRouter>
      <AuthProvider>
        <ClientLogin />
      </AuthProvider>
    </BrowserRouter>
  );

describe("ClientLogin Component", () => {
   beforeEach(() => {
        vi.spyOn(console, "error").mockImplementation(() => {});
    });

  it("renders login page", () => {
    renderComponent();

    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    // expect(screen.getByRole("h1", { name: /LOGIN/i })).toBeInTheDocument();
    //this is wrong because h1 is not role but level so we use heading as role and specify the level in the name section of the getbyrole function as below
    expect(screen.getByRole("heading", { name: /login/i, level:1 })).toBeInTheDocument();
      expect(screen.getByText(/Never lose your cart/i)).toBeInTheDocument();
        expect(screen.getByText(/cart history/i)).toBeInTheDocument();
          expect(screen.getByText(/real api connection/i)).toBeInTheDocument();
          expect(screen.getByText(/swoo tech mart/i)).toBeInTheDocument();

           }); 
 
it("Check Button functionality",()=>{
    renderComponent();
     expect(screen.getByTestId("login-button")).toBeEnabled();
     const passwordInput = screen.getByTestId("password-input");
     expect(passwordInput).toBeInTheDocument();
     expect(passwordInput).toHaveAttribute("type");
    expect(screen.getAllByTestId("demo-account-button")[0]).toBeEnabled();
    expect(screen.getByTestId("login-button")).toHaveAttribute("type", "submit");
    //to check if it has sumit type

    expect(document.querySelectorAll('button[type="submit"]')).toHaveLength(1);
//this ensures that in the whole document there is only one submit button which is the login button
   
  });
  
 

  it("allows user to type username and password", async () => {
    renderComponent();
    const user = userEvent.setup();

    const usernameInput = screen.getByTestId("username-input");
    const passwordInput = screen.getByTestId("password-input");

    await user.type(usernameInput, "johnd");
    await user.type(passwordInput, "123456");

    expect(usernameInput).toHaveValue("johnd");
    expect(passwordInput).toHaveValue("123456");
  });

  it("shows error message on failed login", async () => {
    renderComponent();
    const user = userEvent.setup();

    await user.type(
      screen.getByTestId("username-input"),
      "wronguser"
    );
    await user.type(
      screen.getByTestId("password-input"),
      "wrongpass"
    );
    await user.click(screen.getByTestId("login-button"));
    // Wait for error message to appear
    await waitFor(() => {
      expect( screen.getByText(/wrong username or password/i) ).toBeInTheDocument();
    });
  });

  
  it("Demo Account fills credentials when clicked", async () => {
    renderComponent();
    const user = userEvent.setup();
    const FirstElements = screen.getAllByTestId("demo-account-button")[0]
    await user.click(FirstElements);
    await waitFor(() => {


      const inputName = screen.getByTestId("username-input");
      expect(inputName.value.length).toBeGreaterThan(0);

      const inputPassword =screen.getByTestId("password-input");
      expect(inputPassword.value.length).toBeGreaterThan(0);

    //  expect(screen.getByTestId("username-input")).toHaveValue('johnd');
//shouldnt be used beacuse it expose the password and username which we dont wanna pass to coding as it is crucial.
    //   expect(screen.getByTestId("password-input")).toHaveValue('m38rmF$');
    });

       await user.click(screen.getByTestId("login-button"));
       expect(screen.getByTestId("login-button")).toBeDisabled();
  });
});