import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { ReactNode  } from "react";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Login from "./pages/LoginPage/Login";
import { Provider } from "react-redux";
import { store } from "./store/store";
//import ApiKeyManagement from "./pages/UserManagement/ApiKeyManagement";

import { UserRoutes } from "./router/UserRoutes";
import { UrlRoutes } from "./router/UrlRoutes";
import { RequestLog } from "./router/RequestLog";
import { BlockedIp } from "./router/BlockedIpList";


// Function to check authentication
const isAuthenticated = () => {
  return localStorage.getItem("token"); // Check if a token exists
};

// Private Route Wrapper
const PrivateRoute = ({ children }: { children: ReactNode }) => {
    return isAuthenticated() ? children : <Navigate to="/" replace />;
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <ScrollToTop />
        <Routes>
        <Route path="/" element={<Login />} />
          <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
            <Route index path="/home" element={<Home />} />
            {UserRoutes()}
            {UrlRoutes()}
            {RequestLog()}
            {BlockedIp()}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </Provider>
  );
}
export default App;