import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import Landing from "./pages/Landing";
import PoolsidePicks from "./pages/PoolsidePicks";
import Admin from "./pages/Admin";
import CompanyAdmin from "./pages/CompanyAdmin";
import HiddenCompanyAdmin from "./pages/HiddenCompanyAdmin";
import About from "./pages/About";
import PoolConfig from "./pages/PoolConfig";
import Auth from "./pages/Auth";
import Draft from "./pages/Draft";
import MyTeams from "./pages/MyTeams";
import Invite from "./pages/Invite";
import Chat from "./pages/Chat";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/test",
    element: <div style={{padding: "20px", background: "lightgreen"}}>Test Route Works! React Router is functioning properly.</div>
  },
  {
    path: "/",
    element: <PoolsidePicks />
  },
  {
    path: "/landing",
    element: <Landing />
  },
  {
    path: "/dashboard",
    element: <Index />
  },
  {
    path: "/admin",
    element: <Admin />
  },
  {
    path: "/company-admin",
    element: <CompanyAdmin />
  },
  {
    path: "/hidden-company-admin",
    element: <HiddenCompanyAdmin />
  },
  {
    path: "/about",
    element: <About />
  },
  {
    path: "/pool-config",
    element: <PoolConfig />
  },
  {
    path: "/auth",
    element: <Auth />
  },
  {
    path: "/draft",
    element: <Draft />
  },
  {
    path: "/my-teams",
    element: <MyTeams />
  },
  {
    path: "/chat",
    element: <Chat />
  },
  {
    path: "/privacy-policy",
    element: <PrivacyPolicy />
  },
  {
    path: "/invite/:code",
    element: <Invite />
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}

