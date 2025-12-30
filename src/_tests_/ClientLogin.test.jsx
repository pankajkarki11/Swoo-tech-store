import{render,screen,waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event"
import ClientLogin from "../pages/client/ClientLogin";
import {BrowserRouter} from "react-router-dom";
import {vi,describe,it,afterEach,expect,beforeEach} from "vitest";




const mockNavigate =vi.fn();
vi.mock("react-router-dom",async()=>{
    const actual = await vi.importActual("react-router-dom");
    return{
        ...actual,
        useNavigate:()=>mockNavigate,
    } ;
});


const mockLogin=vi.fn();
vi.mock("../contexts/AuthContext",()=>({
    useAuth:()=>({
        login:mockLogin,
        isAuthenticated:false,
    }),
}));


vi.mock("react-hot-toast",()=>({
    toast:{
        success:vi.fn(),
        error:vi.fn(),
    },
}));


const renderComponent=()=>
    render(
        <BrowserRouter>
        <ClientLogin/>
        </BrowserRouter>
    )

describe("ClientLogin Component",()=>{
    beforeEach(()=>{
        vi.clearAllMocks();
      
    });

    afterEach(()=>{
        vi.clearAllTimers();
    });

    it("renders login page",()=>{
        renderComponent();
       
        expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
        expect(screen.getByRole("button",{name:/sign in/i})).toBeInTheDocument();
       
    });


    it("allows user to type username and password",async()=>{
        renderComponent();

        const user =userEvent.setup();

        const usernameInput =screen.getByPlaceholderText(/enter your username/i);
        const passwordInput =screen.getByPlaceholderText(/enter your password/i);

        await user.type(usernameInput,"johnd");
        await user.type(passwordInput,'123456');


        expect(usernameInput).toHaveValue('johnd');
        expect(passwordInput).toHaveValue('123456');
    });


    it("calls login and navigate on successful login",async()=>{
        mockLogin.mockResolvedValueOnce({success:true});
        renderComponent();

        const user=userEvent.setup();

        await user.type(screen.getByPlaceholderText(/enter your username/i),"johnd");
        await user.type(screen.getByPlaceholderText(/enter your password/i),"m38rmF$");

        await user.click(screen.getByRole("button",{name:/sign in/i}));

        await waitFor(()=>{
            expect(mockLogin).toHaveBeenCalledWith({
                username:"johnd",
                password:"m38rmF$",
            });
        });
  
        await waitFor(()=>{
            expect(mockNavigate).toHaveBeenCalledWith("/");

        },{timeout:3000});
    });

  it("shows error message on failed login", async () => {
    mockLogin.mockResolvedValue({ success: false });

    renderComponent();
    const user = userEvent.setup();

    await user.type(
      screen.getByPlaceholderText(/enter your username/i),
      "wronguser"
    );
    await user.type(
      screen.getByPlaceholderText(/enter your password/i),
      "wrongpass"
    );

    await user.click(
      screen.getByRole("button", { name: /sign in/i })
    );

    await waitFor(() => {
      expect(
        screen.getByText(/wrong username or password/i)
      ).toBeInTheDocument();
    });
  });


  it("Demo Account",async()=>{
    renderComponent();
    const user =userEvent.setup();

    const johnDoeElements=screen.getAllByText(/john doe/i);
    const johnDoeButton=johnDoeElements.find(el=>el.tagName==="BUTTON"||el.closest("button"))||johnDoeElement[0];
    await user.click(johnDoeButton);

    await waitFor(()=>{
        expect(screen.getByPlaceholderText(/enter your username/i)).toHaveValue("johnd");
    });

    await waitFor(()=>{
        expect(screen.getByPlaceholderText(/enter your password/i)).toHaveValue("m38rmF$");
    });
  });
});