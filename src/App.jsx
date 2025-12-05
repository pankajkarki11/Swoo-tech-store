import { useState } from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import EcommerceHomepage from "./pages/Home";
import Header from "./Components/Header";
import Layout from "./Components/Layout";
import Footer from "./Components/Footer";
import EcommerceLogin from "./pages/Login";

function App() {
  return (
    <Layout>
      <main>
        <Routes>
          <Route path="/" element={<EcommerceHomepage />} />
          <Route path="/login" element={<EcommerceLogin />} />
        </Routes>
      </main>
    </Layout>
  );
}

export default App;
// App.jsx
// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import EcommerceLogin from "./pages/login";
// import EcommerceHomepage from "./pages/home";
// import NotFound from "./pages/NotFound"; // Optional: Create a 404 page

// function App() {
//   return (
//     <Router>
//       <Routes>
//         {/* Default route redirects to home */}
//         <Route path="/" element={<Navigate to="/home" replace />} />

//         {/* Login page route */}
//         <Route path="/login" element={<EcommerceLogin />} />

//         {/* Home page route */}
//         <Route path="/home" element={<EcommerceHomepage />} />

//         {/* Optional: 404 page for undefined routes */}
//         <Route path="*" element={<NotFound />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;
