import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const interestCategories = [
  {
    name: "Photography",
    description: "Share your vision and learn from fellow photographers",
    icon: "fas fa-camera",
    color: "bg-blue-500",
    memberCount: "2,341",
    status: "Active"
  },
  {
    name: "Outdoor Adventures",
    description: "Explore nature with adventurous souls",
    icon: "fas fa-mountain",
    color: "bg-green-500",
    memberCount: "1,892",
    status: "Growing"
  },
  {
    name: "Culinary Arts",
    description: "Share recipes and cooking experiences",
    icon: "fas fa-utensils",
    color: "bg-pink-500",
    memberCount: "3,156",
    status: "Popular"
  },
  {
    name: "Music & Arts",
    description: "Connect with creative minds and artists",
    icon: "fas fa-music",
    color: "bg-yellow-500",
    memberCount: "2,847",
    status: "Creative"
  },
  {
    name: "Technology",
    description: "Discuss latest tech trends and innovations",
    icon: "fas fa-code",
    color: "bg-purple-500",
    memberCount: "4,623",
    status: "Trending"
  },
  {
    name: "Fitness & Health",
    description: "Join fitness enthusiasts and wellness advocates",
    icon: "fas fa-dumbbell",
    color: "bg-red-500",
    memberCount: "3,421",
    status: "Motivating"
  }
];

const featuredUsers = [
  {
    name: "Sarah Chen",
    location: "San Francisco, CA",
    bio: "Passionate photographer exploring urban landscapes and street art. Always looking for new perspectives and creative collaborations.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    interests: ["Photography", "Art", "Travel"],
    status: "online"
  },
  {
    name: "Marcus Rivera",
    location: "Boulder, CO",
    bio: "Adventure seeker and mountain enthusiast. Love organizing hiking trips and exploring new trails with fellow outdoor lovers.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    interests: ["Hiking", "Climbing", "Fitness"],
    status: "away"
  },
  {
    name: "Elena Rodriguez",
    location: "Austin, TX",
    bio: "Culinary artist and food blogger. I love experimenting with fusion cuisines and hosting cooking workshops for fellow food enthusiasts.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150",
    interests: ["Cooking", "Food Blogging", "Nutrition"],
    status: "online"
  }
];

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold text-slate-900" data-testid="logo-text">ConnectHub</span>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#discover" className="text-slate-600 hover:text-primary transition-colors" data-testid="nav-discover">Discover</a>
              <a href="#features" className="text-slate-600 hover:text-primary transition-colors" data-testid="nav-features">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-primary transition-colors" data-testid="nav-how-it-works">How it Works</a>
            </nav>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={handleLogin}
                data-testid="button-signin"
              >
                Sign In
              </Button>
              <Button 
                onClick={handleLogin}
                data-testid="button-join"
              >
                Join Now
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-white to-secondary/10 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight" data-testid="hero-title">
                  Find Your <span className="text-primary">Community</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed" data-testid="hero-description">
                  Connect with like-minded people who share your interests. Build meaningful relationships through shared hobbies, activities, and passions.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={handleLogin}
                  data-testid="button-get-started"
                >
                  Get Started Free
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  data-testid="button-learn-more"
                >
                  Learn More
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Photography", "Hiking", "Cooking", "Music", "Gaming"].map((interest) => (
                  <Badge key={interest} variant="secondary" data-testid={`interest-tag-${interest.toLowerCase()}`}>
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1543269664-56d93c1b41a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="People networking and connecting" 
                className="rounded-2xl shadow-2xl w-full"
                data-testid="hero-image"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                    <i className="fas fa-users text-white"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900" data-testid="stat-members">10,000+</p>
                    <p className="text-sm text-slate-600">Active Members</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Unique Bored Community Features */}
      <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50" id="bored-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <div className="flex justify-center items-center space-x-3 mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <i className="fas fa-coffee text-white text-2xl"></i>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900" data-testid="bored-title">I am Bored - Our Magic Feature!</h2>
            </div>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="bored-description">
              Unlike other social platforms, we solve the universal problem: "I'm bored, what should I do?" Connect instantly with people feeling the same way!
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-amber-200" data-testid="bored-explore-community">
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <i className="fas fa-users text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Explore Bored Community</h3>
                    <p className="text-slate-600 mb-4">Discover people in your area who are also bored right now. Join spontaneous activities, find adventure partners, or create impromptu meetups!</p>
                    <Badge className="bg-purple-100 text-purple-800">Live Community Feature</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-amber-200" data-testid="bored-mark-myself">
              <CardContent className="p-8 text-center">
                <div className="space-y-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <i className="fas fa-hand-paper text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Mark Myself as Bored</h3>
                    <p className="text-slate-600 mb-4">Let others know you're available for activities! Get matched with people nearby looking for the same experiences, events, or just someone to hang out with.</p>
                    <Badge className="bg-green-100 text-green-800">Instant Matching</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 text-xl px-8 py-4"
              onClick={handleLogin}
              data-testid="button-bored-cta"
            >
              <i className="fas fa-coffee mr-3"></i>
              I'm Bored Right Now - Let's Connect!
              <i className="fas fa-magic ml-3"></i>
            </Button>
          </div>
        </div>
      </section>

      {/* Entertainment Features Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50" id="entertainment">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900" data-testid="entertainment-title">Entertainment & Events</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="entertainment-description">
              Discover movies, live shows, concerts, sports events, and popular happenings in your area.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            {[
              { name: "Movies", icon: "fas fa-film", color: "bg-blue-500", description: "Latest releases + movie promotions" },
              { name: "Theaters", icon: "fas fa-theater-masks", color: "bg-purple-500", description: "Live shows + ticket discounts" },
              { name: "Concerts", icon: "fas fa-music", color: "bg-green-500", description: "Live music + exclusive tickets" },
              { name: "Sports", icon: "fas fa-football-ball", color: "bg-red-500", description: "Team formation + equipment ads" },
              { name: "Popular Events", icon: "fas fa-star", color: "bg-yellow-500", description: "Trending events + company ads" }
            ].map((item) => (
              <Card key={item.name} className="group hover:shadow-lg transition-all duration-300 cursor-pointer" data-testid={`entertainment-card-${item.name.toLowerCase()}`}>
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform`}>
                      <i className={`${item.icon} text-white text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.name}</h3>
                      <p className="text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              onClick={handleLogin}
              data-testid="button-entertainment-cta"
            >
              <i className="fas fa-magic mr-2"></i>
              Get Started Free - Access All Entertainment
              <i className="fas fa-sparkles ml-2 text-yellow-300"></i>
            </Button>
            <p className="text-sm text-slate-500 max-w-2xl mx-auto">
              <i className="fas fa-shield-alt mr-1"></i>
              Join safely with our community rating system and age-appropriate matching
            </p>
          </div>
        </div>
      </section>

      {/* Age Groups & Location Features */}
      <section className="py-20 bg-slate-50" id="safety-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Safe & Smart Matching</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Connect with people in your age group, nearby location, and with verified community ratings for safer interactions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-users-cog text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Age Group Matching</h3>
                <p className="text-slate-600">Find people in your age range for more comfortable and appropriate connections.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-map-marker-alt text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Location-Based Events</h3>
                <p className="text-slate-600">Discover activities and form teams with people in your local area.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-white text-xl"></i>
                </div>
                <h3 className="text-lg font-semibold mb-2">Community Ratings</h3>
                <p className="text-slate-600">Rate your experiences to help build a safer, more trustworthy community.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sports Team Formation */}
      <section className="py-20 bg-green-50" id="team-formation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Find Your Sports Team</h2>
              <p className="text-xl text-slate-600 mb-8">
                Need 11 players for soccer? Looking for a basketball team? Use our calendar integration and instant team finder to organize sports activities in your area.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <i className="fas fa-calendar-plus text-green-500 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold">Calendar Integration</h4>
                    <p className="text-slate-600">Schedule games and practices with team availability</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-search-location text-green-500 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold">Find Teammates</h4>
                    <p className="text-slate-600">Instantly connect with players in your territory</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <i className="fas fa-shopping-cart text-green-500 text-xl mt-1"></i>
                  <div>
                    <h4 className="font-semibold">Equipment Marketplace</h4>
                    <p className="text-slate-600">Companies advertise jerseys, balls, spikes, and gear</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Soccer Jerseys", icon: "fas fa-tshirt", ads: "Nike, Adidas" },
                { name: "Soccer Balls", icon: "fas fa-futbol", ads: "FIFA Official" },
                { name: "Sports Spikes", icon: "fas fa-shoe-prints", ads: "Under Armour" },
                { name: "Team Gear", icon: "fas fa-dumbbell", ads: "Decathlon" }
              ].map((item, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <i className={`${item.icon} text-white`}></i>
                    </div>
                    <h4 className="font-semibold text-sm mb-1">{item.name}</h4>
                    <p className="text-xs text-slate-500">{item.ads}</p>
                    <Badge variant="outline" className="text-xs mt-2">Sponsored</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer Section */}
      <section className="py-16 bg-slate-900 text-white" id="legal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center items-center space-x-3 mb-6">
              <i className="fas fa-shield-alt text-yellow-400 text-2xl"></i>
              <h2 className="text-2xl font-bold">Safety & Legal Information</h2>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-4 text-left bg-slate-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">Important Safety Notice</h3>
              <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
                <p>
                  <strong>⚠️ Personal Responsibility:</strong> It is your own responsibility to join groups and activities with unknown people. Always meet in public places and inform someone you trust about your plans.
                </p>
                <p>
                  <strong>🛡️ Community Safety:</strong> Our platform includes a community rating system where users can share their experiences. This helps maintain a safer environment, but does not guarantee safety.
                </p>
                <p>
                  <strong>📍 Location Sharing:</strong> Location features are optional. You control what location information you share for nearby events and team formation.
                </p>
                <p>
                  <strong>👥 Age-Appropriate Matching:</strong> Our age group filters help you connect with people in similar life stages, but age verification is based on user-provided information.
                </p>
                <p>
                  <strong>⚖️ No Discrimination:</strong> Our rating system focuses on activity experiences and reliability, not personal characteristics. Any discriminatory behavior is prohibited.
                </p>
                <p>
                  <strong>🚫 Platform Liability:</strong> ConnectHub facilitates connections but is not responsible for interactions between users. Use good judgment and prioritize your safety.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                size="lg"
                className="bg-yellow-500 text-black hover:bg-yellow-400 font-semibold"
                onClick={handleLogin}
              >
                <i className="fas fa-check-circle mr-2"></i>
                I Understand - Create My Account
              </Button>
              <p className="text-xs text-slate-400">
                By creating an account, you agree to our Terms of Service, Privacy Policy, and Community Guidelines
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interest Categories Section */}
      <section className="py-20 bg-white" id="discover">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900" data-testid="interests-title">Discover Your Interests</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="interests-description">
              Connect with people who share your passions. From outdoor adventures to creative pursuits, find your tribe.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interestCategories.map((category) => (
              <Card key={category.name} className="group hover:shadow-lg transition-all duration-300 cursor-pointer" data-testid={`interest-card-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <i className={`${category.icon} text-white text-xl`}></i>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2" data-testid={`interest-name-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>{category.name}</h3>
                      <p className="text-slate-600 mb-4" data-testid={`interest-description-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>{category.description}</p>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-slate-500" data-testid={`interest-members-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>{category.memberCount} members</span>
                        <Badge variant="outline" data-testid={`interest-status-${category.name.toLowerCase().replace(/\s+/g, '-')}`}>{category.status}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Users Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900" data-testid="users-title">Meet Amazing People</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto" data-testid="users-description">
              Discover members who share your interests and start meaningful connections.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredUsers.map((user) => (
              <Card key={user.name} className="hover:shadow-lg transition-all duration-300" data-testid={`user-card-${user.name.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={user.image} 
                          alt={`${user.name} profile`} 
                          className="w-16 h-16 rounded-full object-cover"
                          data-testid={`user-image-${user.name.toLowerCase().replace(/\s+/g, '-')}`}
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900" data-testid={`user-name-${user.name.toLowerCase().replace(/\s+/g, '-')}`}>{user.name}</h3>
                          <p className="text-sm text-slate-500" data-testid={`user-location-${user.name.toLowerCase().replace(/\s+/g, '-')}`}>{user.location}</p>
                          <div className="flex items-center space-x-1 mt-1">
                            <span className={`text-xs ${user.status === 'online' ? 'text-green-500' : 'text-yellow-500'}`}>●</span>
                            <span className="text-xs text-slate-500" data-testid={`user-status-${user.name.toLowerCase().replace(/\s+/g, '-')}`}>
                              {user.status === 'online' ? 'Online now' : '2h ago'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm" data-testid={`user-bio-${user.name.toLowerCase().replace(/\s+/g, '-')}`}>
                      {user.bio}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest) => (
                        <Badge key={interest} variant="secondary" data-testid={`user-interest-${user.name.toLowerCase().replace(/\s+/g, '-')}-${interest.toLowerCase()}`}>
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      <Button 
                        className="flex-1" 
                        onClick={handleLogin}
                        data-testid={`button-connect-${user.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        Connect
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleLogin}
                        data-testid={`button-message-${user.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={handleLogin}
              data-testid="button-load-more"
            >
              Load More People
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-white" data-testid="cta-title">
                Your Community Awaits
              </h2>
              <p className="text-xl text-purple-100 max-w-2xl mx-auto" data-testid="cta-description">
                Join thousands of people who have found their community through shared interests. Start your journey today.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                variant="secondary"
                onClick={handleLogin}
                data-testid="button-join-today"
              >
                Join ConnectHub Today
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary"
                data-testid="button-watch-demo"
              >
                Watch Demo
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-8 pt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-white" data-testid="stat-active-members">10,000+</p>
                <p className="text-purple-100">Active Members</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white" data-testid="stat-interest-categories">50+</p>
                <p className="text-purple-100">Interest Categories</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white" data-testid="stat-connections-made">100k+</p>
                <p className="text-purple-100">Connections Made</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
                  <i className="fas fa-users text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold" data-testid="footer-logo">ConnectHub</span>
              </div>
              <p className="text-slate-400" data-testid="footer-description">
                Building meaningful connections through shared interests and hobbies.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-features">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-how-it-works">How it Works</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-privacy">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-safety">Safety</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Community</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-interest-groups">Interest Groups</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-events">Events</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-blog">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-success-stories">Success Stories</a></li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Support</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-help">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-contact">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-terms">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors" data-testid="footer-link-privacy-policy">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p data-testid="footer-copyright">&copy; 2024 ConnectHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
