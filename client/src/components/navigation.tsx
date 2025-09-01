import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

export function Navigation() {
  const { user } = useAuth();
  const [location] = useLocation();

  const { data: connectionRequests } = useQuery({
    queryKey: ["/api/connection-requests"],
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navItems = [
    { href: "/", label: "Home", icon: "fas fa-home" },
    { href: "/discover", label: "Discover", icon: "fas fa-search" },
    { href: "/hobbies", label: "Hobbies", icon: "fas fa-palette" },
    { href: "/movies", label: "Movies", icon: "fas fa-film" },
    { href: "/theaters", label: "Theaters", icon: "fas fa-theater-masks" },
    { href: "/concerts", label: "Concerts", icon: "fas fa-music" },
    { href: "/sports", label: "Sports", icon: "fas fa-football-ball" },
    { href: "/popular-events", label: "Popular Events", icon: "fas fa-star" },
    { href: "/connections", label: "Connections", icon: "fas fa-users" },
    { href: "/messages", label: "Messages", icon: "fas fa-envelope" },
    { href: "/profile", label: "Profile", icon: "fas fa-user" },
  ];

  const getStartedItem = { href: "/bored", label: "I am Bored", icon: "fas fa-magic" };

  const pendingRequestCount = (connectionRequests as any[])?.length || 0;

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer" data-testid="logo">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold text-slate-900">ConnectHub</span>
              </div>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-1">
            {/* All Navigation Items */}
            {navItems.slice(0, 8).map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "default" : "ghost"}
                  className="relative"
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <i className={`${item.icon} mr-2`}></i>
                  {item.label}
                  {item.label === "Connections" && pendingRequestCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 px-1 min-w-[1.25rem] h-5 text-xs"
                      data-testid="nav-badge-connections"
                    >
                      {pendingRequestCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}

            {/* Get Started Free (Magic Tab) */}
            <Link href={getStartedItem.href}>
              <Button
                className={`flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg ${
                  location === getStartedItem.href ? "ring-2 ring-purple-300" : ""
                }`}
                data-testid="nav-get-started-free"
              >
                <i className={getStartedItem.icon}></i>
                <span>Get Started Free</span>
                <i className="fas fa-sparkles ml-1 text-yellow-300"></i>
              </Button>
            </Link>

            {/* More menu for remaining items */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  <i className="fas fa-ellipsis-h"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {navItems.slice(8).map((item) => (
                  <Link key={item.href} href={item.href}>
                    <DropdownMenuItem
                      className={`flex items-center space-x-2 ${
                        location === item.href ? "bg-primary/10 text-primary" : ""
                      }`}
                      data-testid={`more-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      <i className={item.icon}></i>
                      <span>{item.label}</span>
                    </DropdownMenuItem>
                  </Link>
                ))}
                <Link href="/activity-feed">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <i className="fas fa-stream"></i>
                    <span>Activity</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/events">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <i className="fas fa-calendar"></i>
                    <span>Events</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/groups">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <i className="fas fa-layer-group"></i>
                    <span>Groups</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/skills">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <i className="fas fa-graduation-cap"></i>
                    <span>Skills</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/notifications">
                  <DropdownMenuItem className="flex items-center space-x-2">
                    <i className="fas fa-bell"></i>
                    <span>Notifications</span>
                  </DropdownMenuItem>
                </Link>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-3">
              <img 
                src={(user as any)?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"} 
                alt="Profile" 
                className="w-8 h-8 rounded-full object-cover"
                data-testid="nav-profile-image"
              />
              <div className="text-sm">
                <p className="font-medium text-slate-900" data-testid="nav-user-name">
                  {(user as any)?.displayName || (user as any)?.firstName || "User"}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-slate-200">
        <div className="flex justify-around py-2 overflow-x-auto">
          {[...navItems.slice(0, 5), getStartedItem].map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                size="sm"
                className={`relative whitespace-nowrap ${location === item.href ? 'text-primary' : 'text-slate-600'} ${
                  item.label === 'I am Bored' ? 'text-purple-600' : ''
                }`}
                data-testid={`mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex flex-col items-center">
                  <i className={`${item.icon} text-lg ${item.label === 'I am Bored' ? 'text-purple-600' : ''}`}></i>
                  <span className={`text-xs mt-1 ${item.label === 'I am Bored' ? 'font-semibold' : ''}`}>
                    {item.label === 'I am Bored' ? 'Get Started' : item.label}
                  </span>
                  {item.label === "Connections" && pendingRequestCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 px-1 min-w-[1rem] h-4 text-xs"
                      data-testid="mobile-nav-badge-connections"
                    >
                      {pendingRequestCount}
                    </Badge>
                  )}
                </div>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
