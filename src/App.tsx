import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { HelmetProvider } from "react-helmet-async";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import { useEarlyAccess } from "@/hooks/useEarlyAccess";
import { AdminGate } from "@/components/AdminGate";
import { PremiumGate } from "@/components/PremiumGate";
import { AuthGate } from "@/components/AuthGate";
import { DeferredAnalytics } from "@/components/DeferredAnalytics";
import { lazy, Suspense } from "react";
import ScrollManager from "./hooks/useScrollManager";

// Loading component for suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Lazy load all pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const NewIdea = lazy(() => import("./pages/NewIdea"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const NewLandingPage = lazy(() => import("./pages/NewLandingPage"));
const Auth = lazy(() => import("./pages/Auth"));
const PricingPage = lazy(() => import("./pages/PricingPageNew"));
const Archive = lazy(() => import("./pages/Archive"));
const BlogList = lazy(() => import("./pages/BlogList"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AdminBlogs = lazy(() => import("./pages/AdminBlogs"));
const BuildThisIdea = lazy(() => import("./pages/BuildThisIdea"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WhyNowDetails = lazy(() => import("./pages/WhyNowDetails"));
const WhyNowFullAnalysis = lazy(() => import("./pages/WhyNowFullAnalysis"));
const TrendsFullAnalysis = lazy(() => import("./pages/TrendsFullAnalysis"));
const OpportunityFullAnalysis = lazy(() => import("./pages/OpportunityFullAnalysis"));
const CommunityFullAnalysis = lazy(() => import("./pages/CommunityFullAnalysis"));
const FeasibilityFullAnalysis = lazy(() => import("./pages/FeasibilityFullAnalysis"));
const RevenueFullAnalysis = lazy(() => import("./pages/RevenueFullAnalysis"));
const ExecutionFullAnalysis = lazy(() => import("./pages/ExecutionFullAnalysis"));
const WhyNowFullAnalysisDynamic = lazy(() => import("./pages/WhyNowFullAnalysisDynamic"));
const TrendsFullAnalysisDynamic = lazy(() => import("./pages/TrendsFullAnalysisDynamic"));
const OpportunityFullAnalysisDynamic = lazy(() => import("./pages/OpportunityFullAnalysisDynamic"));
const CommunityFullAnalysisDynamic = lazy(() => import("./pages/CommunityFullAnalysisDynamic"));
const FeasibilityFullAnalysisDynamic = lazy(() => import("./pages/FeasibilityFullAnalysisDynamic"));
const RevenueFullAnalysisDynamic = lazy(() => import("./pages/RevenueFullAnalysisDynamic"));
const ExecutionFullAnalysisDynamic = lazy(() => import("./pages/ExecutionFullAnalysisDynamic"));
const IdeaReport = lazy(() => import("./pages/IdeaReport"));
const BuildIdeaDynamic = lazy(() => import("./pages/BuildIdeaDynamicNew"));
const ResearchMyIdea = lazy(() => import("./pages/ResearchMyIdea"));
const UserIdeaReport = lazy(() => import("./pages/UserIdeaReport"));
const UserBuildIdea = lazy(() => import("./pages/UserBuildIdea"));
const UserReportWhyNowFullAnalysis = lazy(() => import("./pages/UserReportWhyNowFullAnalysis"));
const UserReportTrendsFullAnalysis = lazy(() => import("./pages/UserReportTrendsFullAnalysis"));
const UserReportOpportunityFullAnalysis = lazy(() => import("./pages/UserReportOpportunityFullAnalysis"));
const UserReportCommunityFullAnalysis = lazy(() => import("./pages/UserReportCommunityFullAnalysis"));
const UserReportFeasibilityFullAnalysis = lazy(() => import("./pages/UserReportFeasibilityFullAnalysis"));
const UserReportRevenueFullAnalysis = lazy(() => import("./pages/UserReportRevenueFullAnalysis"));
const UserReportExecutionFullAnalysis = lazy(() => import("./pages/UserReportExecutionFullAnalysis"));
const UserReportMarketNews = lazy(() => import("./pages/UserReportMarketNews"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminPodcastAnalytics = lazy(() => import("./pages/AdminPodcastAnalytics"));
const AdminUserReports = lazy(() => import("./pages/AdminUserReports"));
const AdminViewUserReport = lazy(() => import("./pages/AdminViewUserReport"));
const AdminViewUserBuild = lazy(() => import("./pages/AdminViewUserBuild"));
const AdminUserReportWhyNowFullAnalysis = lazy(() => import("./pages/AdminUserReportWhyNowFullAnalysis"));
const AdminUserReportTrendsFullAnalysis = lazy(() => import("./pages/AdminUserReportTrendsFullAnalysis"));
const AdminUserReportOpportunityFullAnalysis = lazy(() => import("./pages/AdminUserReportOpportunityFullAnalysis"));
const AdminUserReportCommunityFullAnalysis = lazy(() => import("./pages/AdminUserReportCommunityFullAnalysis"));
const AdminUserReportFeasibilityFullAnalysis = lazy(() => import("./pages/AdminUserReportFeasibilityFullAnalysis"));
const AdminUserReportRevenueFullAnalysis = lazy(() => import("./pages/AdminUserReportRevenueFullAnalysis"));
const AdminUserReportExecutionFullAnalysis = lazy(() => import("./pages/AdminUserReportExecutionFullAnalysis"));
const AdminUserReportMarketNews = lazy(() => import("./pages/AdminUserReportMarketNews"));
const WaitlistPage = lazy(() => import("./pages/WaitlistPage"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const Account = lazy(() => import("./pages/Account"));
const PaymentSuccess = lazy(() => import("./pages/payment/Success"));
const PaymentFailure = lazy(() => import("./pages/payment/Failure"));
const Destination = lazy(() => import("./pages/Destination"));
const Leads = lazy(() => import("./pages/Leads"));
const AccountSetup = lazy(() => import("./pages/AccountSetup"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30,   // 30 minutes cache
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,  // Refetch when network reconnects
      retry: 3,                  // Retry failed requests 3 times before giving up
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 15000), // Exponential backoff: 1s, 2s, 4s (max 15s)
    },
  },
});

const AppContent = () => {
  const location = useLocation();
  const { hasAccess } = useEarlyAccess();
  
  // Hide header/footer on waitlist page, new landing page, destination page, and leads page
  // Also hide on about/contact/privacy pages if user doesn't have early access
  const isWaitlistPage = location.pathname === '/waitlist';
  const isNewLandingPage = location.pathname === '/new-landing-page';
  const isDestinationPage = location.pathname === '/destination';
  const isLeadsPage = location.pathname === '/leads';
  const isPublicPage = location.pathname === '/about' || location.pathname === '/contact' || location.pathname === '/privacy' || location.pathname === '/terms' || location.pathname === '/refund-policy';
  const showHeaderFooter = !isWaitlistPage && !isNewLandingPage && !isDestinationPage && !isLeadsPage && !(isPublicPage && !hasAccess);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* <ScrollToTop /> */}
      <ScrollManager/>
      {showHeaderFooter && (
        <>
          <Header />
        </>
      )}
      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
        
          <Routes>
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/" element={<Index />} />
            <Route path="/landing-page" element={<LandingPage />} />
            <Route path="/new-landing-page" element={<NewLandingPage />} />
            <Route path="/destination" element={<Destination />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/account-setup" element={<AccountSetup />} />
            <Route path="/new-idea" element={<NewIdea />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={
              <AuthGate>
                <Account />
              </AuthGate>
            } />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failure" element={<PaymentFailure />} />
            <Route path="/archive" element={<Archive />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/why-now-details" element={<WhyNowDetails />} />
            <Route path="/build-this-idea" element={<BuildThisIdea />} />
            <Route path="/why-now-full-analysis" element={<WhyNowFullAnalysis />} />
            <Route path="/trends-full-analysis" element={<TrendsFullAnalysis />} />
            <Route path="/opportunity-full-analysis" element={<OpportunityFullAnalysis />} />
            <Route path="/community-full-analysis" element={<CommunityFullAnalysis />} />
            <Route path="/feasibility-full-analysis" element={<FeasibilityFullAnalysis />} />
            <Route path="/revenue-full-analysis" element={<RevenueFullAnalysis />} />
            <Route path="/execution-full-analysis" element={<ExecutionFullAnalysis />} />
            <Route path="/idea-report/:id" element={<IdeaReport />} />
            <Route path="/build-idea/:id" element={
              <PremiumGate fallback="overlay">
                <BuildIdeaDynamic />
              </PremiumGate>
            } />
            <Route path="/idea-report/:id/why-now-full-analysis" element={
              <PremiumGate fallback="overlay">
                <WhyNowFullAnalysisDynamic />
              </PremiumGate>
            } />
            <Route path="/idea-report/:id/trends-full-analysis" element={
              <PremiumGate fallback="overlay">
                <TrendsFullAnalysisDynamic />
              </PremiumGate>
            } />
            <Route path="/idea-report/:id/opportunity-full-analysis" element={
              <PremiumGate fallback="overlay">
                <OpportunityFullAnalysisDynamic />
              </PremiumGate>
            } />
            <Route path="/idea-report/:id/community-full-analysis" element={
              <PremiumGate fallback="overlay">
                <CommunityFullAnalysisDynamic />
              </PremiumGate>
            } />
            <Route path="/idea-report/:id/feasibility-full-analysis" element={
              <PremiumGate fallback="overlay">
                <FeasibilityFullAnalysisDynamic />
              </PremiumGate>
            } />
            <Route path="/idea-report/:id/revenue-full-analysis" element={
              <PremiumGate fallback="overlay">
                <RevenueFullAnalysisDynamic />
              </PremiumGate>
            } />
            <Route path="/idea-report/:id/execution-full-analysis" element={
              <PremiumGate fallback="overlay">
                <ExecutionFullAnalysisDynamic />
              </PremiumGate>
            } />
            <Route path="/research-my-idea" element={<ResearchMyIdea />} />
            <Route path="/user-report/:id" element={
              <AuthGate>
                <UserIdeaReport />
              </AuthGate>
            } />
            <Route path="/user-build-idea/:id" element={
              <AuthGate>
                <UserBuildIdea />
              </AuthGate>
            } />
            <Route path="/user-report/:id/why-now-full-analysis" element={
              <AuthGate>
                <UserReportWhyNowFullAnalysis />
              </AuthGate>
            } />
            <Route path="/user-report/:id/trends-full-analysis" element={
              <AuthGate>
                <UserReportTrendsFullAnalysis />
              </AuthGate>
            } />
            <Route path="/user-report/:id/opportunity-full-analysis" element={
              <AuthGate>
                <UserReportOpportunityFullAnalysis />
              </AuthGate>
            } />
            <Route path="/user-report/:id/community-full-analysis" element={
              <AuthGate>
                <UserReportCommunityFullAnalysis />
              </AuthGate>
            } />
            <Route path="/user-report/:id/feasibility-full-analysis" element={
              <AuthGate>
                <UserReportFeasibilityFullAnalysis />
              </AuthGate>
            } />
            <Route path="/user-report/:id/revenue-full-analysis" element={
              <AuthGate>
                <UserReportRevenueFullAnalysis />
              </AuthGate>
            } />
            <Route path="/user-report/:id/execution-full-analysis" element={
              <AuthGate>
                <UserReportExecutionFullAnalysis />
              </AuthGate>
            } />
            <Route path="/user-report/:id/market-news" element={
              <AuthGate>
                <UserReportMarketNews />
              </AuthGate>
            } />
            <Route path="/admin" element={
              <AdminGate>
                <AdminDashboard />
              </AdminGate>
            } />
            <Route path="/admin/blogs" element={
              <AdminGate>
                <AdminBlogs />
              </AdminGate>
            } />
            <Route path="/admin/user-reports" element={
              <AdminGate>
                <AdminUserReports />
              </AdminGate>
            } />
            <Route path="/admin/user-report/:id" element={
              <AdminGate>
                <AdminViewUserReport />
              </AdminGate>
            } />
            <Route path="/admin/user-build/:id" element={
              <AdminGate>
                <AdminViewUserBuild />
              </AdminGate>
            } />
            <Route path="/admin/user-report/:id/why-now-full-analysis" element={
              <AdminGate>
                <AdminUserReportWhyNowFullAnalysis />
              </AdminGate>
            } />
            <Route path="/admin/user-report/:id/trends-full-analysis" element={
              <AdminGate>
                <AdminUserReportTrendsFullAnalysis />
              </AdminGate>
            } />
            <Route path="/admin/user-report/:id/opportunity-full-analysis" element={
              <AdminGate>
                <AdminUserReportOpportunityFullAnalysis />
              </AdminGate>
            } />
            <Route path="/admin/user-report/:id/community-full-analysis" element={
              <AdminGate>
                <AdminUserReportCommunityFullAnalysis />
              </AdminGate>
            } />
            <Route path="/admin/user-report/:id/feasibility-full-analysis" element={
              <AdminGate>
                <AdminUserReportFeasibilityFullAnalysis />
              </AdminGate>
            } />
            <Route path="/admin/user-report/:id/revenue-full-analysis" element={
              <AdminGate>
                <AdminUserReportRevenueFullAnalysis />
              </AdminGate>
            } />
            <Route path="/admin/user-report/:id/execution-full-analysis" element={
              <AdminGate>
                <AdminUserReportExecutionFullAnalysis />
              </AdminGate>
            } />
            <Route path="/admin/user-report/:id/market-news" element={
              <AdminGate>
                <AdminUserReportMarketNews />
              </AdminGate>
            } />
            <Route path="/admin/podcast-analytics" element={
              <AdminGate>
                <AdminPodcastAnalytics />
              </AdminGate>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {showHeaderFooter && <Footer />}
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <HelmetProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
          {/* Analytics loaded after page is interactive - improves FCP & LCP */}
          <DeferredAnalytics />
        </TooltipProvider>
      </HelmetProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
