import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/context/ThemeContext";

import Landing        from "./pages/Landing";
import SignIn         from "./pages/SignIn";
import SignUp         from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword  from "./pages/ResetPassword";
import CheckInbox     from "./pages/CheckInbox";
import Feed           from "./pages/Feed";
import PostView       from "./pages/PostView";
import Write          from "./pages/Write";
import Profile        from "./pages/Profile";
import Bookmarks      from "./pages/Bookmarks";
import Notifications  from "./pages/Notifications";
import Settings       from "./pages/Settings";
import Explore        from "./pages/Explore";
import NotFound       from "./pages/NotFound";

// Campus Admin Imports
import CampusAdminLayout from "./components/layout/CampusAdminLayout";
import CampusAdminDashboard from "./pages/campus-admin/CampusAdminDashboard";
import CampusAdminUsers from "./pages/campus-admin/CampusAdminUsers";
import CampusAdminContent from "./pages/campus-admin/CampusAdminContent";
import CampusAdminModeration from "./pages/campus-admin/CampusAdminModeration";
import CampusAdminAnnouncements from "./pages/campus-admin/CampusAdminAnnouncements";
import CampusAdminSettings from "./pages/campus-admin/CampusAdminSettings";
const queryClient = new QueryClient();

// Super Admin Imports
import SuperAdminLayout from "./components/layout/SuperAdminLayout";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import SuperAdminCampuses from "./pages/super-admin/SuperAdminCampuses";
import SuperAdminUsers from "./pages/super-admin/SuperAdminUsers";
import SuperAdminContent from "./pages/super-admin/SuperAdminContent";
import SuperAdminModeration from "./pages/super-admin/SuperAdminModeration";
import SuperAdminAnalytics from "./pages/super-admin/SuperAdminAnalytics";
import SuperAdminPlatformSettings from "./pages/super-admin/SuperAdminPlatformSettings";
import SuperAdminAuditLog from "./pages/super-admin/SuperAdminAuditLog";
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* ── Public ── */}
            <Route path="/"                element={<Landing />}        />
            <Route path="/signin"          element={<SignIn />}          />
            <Route path="/signup"          element={<SignUp />}          />
            <Route path="/forgot-password" element={<ForgotPassword />}  />
            <Route path="/reset-password"  element={<ResetPassword />}   />
            {/* /check-inbox?mode=reset  → after ForgotPassword        */}
            {/* /check-inbox?mode=verify → after SignUp                 */}
            <Route path="/check-inbox"     element={<CheckInbox />}      />

            {/* ── Authenticated ── */}
            <Route path="/feed"                element={<Feed />}         />
            <Route path="/post/:id"            element={<PostView />}     />
            <Route path="/write"               element={<Write />}        />
            <Route path="/profile/:username"   element={<Profile />}      />
            <Route path="/bookmarks"           element={<Bookmarks />}    />
            <Route path="/notifications"       element={<Notifications />}/>
            <Route path="/settings"            element={<Settings />}     />
            <Route path="/explore"             element={<Explore />}      />

            {/* ── Campus Admin ── */}
            <Route path="/campus-admin" element={<CampusAdminLayout />}>
              <Route index element={<Navigate to="/campus-admin/dashboard" replace />} />
              <Route path="dashboard" element={<CampusAdminDashboard />} />
              <Route path="users" element={<CampusAdminUsers />} />
              <Route path="content" element={<CampusAdminContent />} />
              <Route path="moderation" element={<CampusAdminModeration />} />
              <Route path="announcements" element={<CampusAdminAnnouncements />} />
              <Route path="settings" element={<CampusAdminSettings />} />
            </Route>

            {/* ── Super Admin ── */}
            <Route path="/super-admin" element={<SuperAdminLayout />}>
              <Route index element={<Navigate to="/super-admin/dashboard" replace />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="campuses" element={<SuperAdminCampuses />} />
              <Route path="users" element={<SuperAdminUsers />} />
              <Route path="content" element={<SuperAdminContent />} />
              <Route path="moderation" element={<SuperAdminModeration />} />
              <Route path="analytics" element={<SuperAdminAnalytics />} />
              <Route path="platform-settings" element={<SuperAdminPlatformSettings />} />
              <Route path="audit-log" element={<SuperAdminAuditLog />} />
            </Route>
            {/* ── Fallback ── */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;