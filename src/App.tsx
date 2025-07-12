import React, { Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PageLoadingSpinner } from "@/components/ui/loading-spinner";

// Lazy load all route components for better performance
const Index = React.lazy(() => import("./pages/Index"));
const Landing = React.lazy(() => import("./pages/Landing"));
const PoolsidePicks = React.lazy(() => import("./pages/PoolsidePicks"));
const Admin = React.lazy(() => import("./pages/Admin"));
const CompanyAdmin = React.lazy(() => import("./pages/CompanyAdmin"));
const HiddenCompanyAdmin = React.lazy(() => import("./pages/HiddenCompanyAdmin"));
const About = React.lazy(() => import("./pages/About"));
const PoolConfig = React.lazy(() => import("./pages/PoolConfig"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Draft = React.lazy(() => import("./pages/Draft"));
const MyTeams = React.lazy(() => import("./pages/MyTeams"));
const Invite = React.lazy(() => import("./pages/Invite"));
const Chat = React.lazy(() => import("./pages/Chat"));
const PrivacyPolicy = React.lazy(() => import("./pages/PrivacyPolicy"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const router = createBrowserRouter([
  {
    path: "/test",
    element: <div style={{padding: "20px", background: "lightgreen"}}>Test Route Works! React Router is functioning properly.</div>
  },
  {
    path: "/",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading homepage..." />}><PoolsidePicks /></Suspense>
  },
  {
    path: "/landing",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading landing page..." />}><Landing /></Suspense>
  },
  {
    path: "/dashboard",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading dashboard..." />}><Index /></Suspense>
  },
  {
    path: "/admin",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading admin panel..." />}><Admin /></Suspense>
  },
  {
    path: "/company-admin",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading admin..." />}><CompanyAdmin /></Suspense>
  },
  {
    path: "/hidden-company-admin",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading admin..." />}><HiddenCompanyAdmin /></Suspense>
  },
  {
    path: "/about",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading about page..." />}><About /></Suspense>
  },
  {
    path: "/pool-config",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading pool configuration..." />}><PoolConfig /></Suspense>
  },
  {
    path: "/auth",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading authentication..." />}><Auth /></Suspense>
  },
  {
    path: "/draft",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading draft page..." />}><Draft /></Suspense>
  },
  {
    path: "/my-teams",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading your teams..." />}><MyTeams /></Suspense>
  },
  {
    path: "/chat",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading chat..." />}><Chat /></Suspense>
  },
  {
    path: "/privacy-policy",
    element: <Suspense fallback={<PageLoadingSpinner text="Loading privacy policy..." />}><PrivacyPolicy /></Suspense>
  },
  {
    path: "/invite/:code",
    element: <Suspense fallback={<PageLoadingSpinner text="Processing invite..." />}><Invite /></Suspense>
  },
  {
    path: "*",
    element: <Suspense fallback={<PageLoadingSpinner />}><NotFound /></Suspense>
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}

