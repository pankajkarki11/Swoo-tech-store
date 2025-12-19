import HeaderClient from "./HeaderClient";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";

const LayoutClient = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col dark:bg-gray-900">
      <HeaderClient />
      <main className="flex-grow">
        <Outlet />
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default LayoutClient;
