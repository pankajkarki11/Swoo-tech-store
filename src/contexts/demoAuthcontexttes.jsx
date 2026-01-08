import {describe,it ,expect,beforeEach,afterEach,vi} from "vitest";
import{screeen,render,waitFor} from "@testing-library/react";
import { useAuth,AuthProvider } from "./AuthContext";
import { useCart ,CartProvider} from "./CartContext";
import { BrowserRouter } from "react-router-dom";
import HeaderClient from "../components/client/HeaderClient";
import {Toaster} from "react-hot -toast"