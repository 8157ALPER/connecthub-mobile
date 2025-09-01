import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Profile from "@/pages/profile";
import Discover from "@/pages/discover";
import Messages from "@/pages/messages";
import Connections from "@/pages/connections";
import Bored from "@/pages/bored";
import Movies from "@/pages/movies";
import Theaters from "@/pages/theaters";
import Concerts from "@/pages/concerts";
import Sports from "@/pages/sports";
import PopularEvents from "@/pages/popular-events";
import FindTeammates from "@/pages/find-teammates";
import ActivityFeed from "@/pages/activity-feed";
import Events from "@/pages/events";
import Groups from "@/pages/groups";
import Skills from "@/pages/skills";
import Notifications from "@/pages/notifications";
import Hobbies from "@/pages/hobbies";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route>
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-slate-600">Loading...</p>
            </div>
          </div>
        </Route>
      ) : !isAuthenticated ? (
        <Route path="*" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/discover" component={Discover} />
          <Route path="/bored" component={Bored} />
          <Route path="/movies" component={Movies} />
          <Route path="/theaters" component={Theaters} />
          <Route path="/concerts" component={Concerts} />
          <Route path="/sports" component={Sports} />
          <Route path="/popular-events" component={PopularEvents} />
          <Route path="/find-teammates" component={FindTeammates} />
          <Route path="/activity-feed" component={ActivityFeed} />
          <Route path="/events" component={Events} />
          <Route path="/groups" component={Groups} />
          <Route path="/skills" component={Skills} />
          <Route path="/hobbies" component={Hobbies} />
          <Route path="/connections" component={Connections} />
          <Route path="/messages" component={Messages} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/profile" component={Profile} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
