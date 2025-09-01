import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const sampleTeams = [
  {
    id: 1,
    name: "Downtown Soccer Warriors",
    sport: "Soccer",
    currentMembers: 8,
    maxMembers: 11,
    location: "Central Park, NYC",
    ageGroup: "26-35",
    skillLevel: "intermediate",
    nextGame: "Saturday 2:00 PM",
    description: "Looking for 3 more players for weekend matches. We play competitive but friendly games.",
    equipment: "Nike jerseys provided",
    ads: [
      { company: "Nike", product: "Soccer Cleats", discount: "20% off" },
      { company: "Adidas", product: "Team Jerseys", discount: "Buy 5 get 1 free" }
    ]
  },
  {
    id: 2,
    name: "Basketball Ballers",
    sport: "Basketball",
    currentMembers: 4,
    maxMembers: 10,
    location: "Court 7, Brooklyn",
    ageGroup: "18-25",
    skillLevel: "mixed",
    nextGame: "Wednesday 6:00 PM",
    description: "Casual pickup games twice a week. All skill levels welcome!",
    equipment: "Bring your own gear",
    ads: [
      { company: "Under Armour", product: "Basketball Shoes", discount: "15% off" },
      { company: "Wilson", product: "Official Basketballs", discount: "$10 off" }
    ]
  },
  {
    id: 3,
    name: "Tennis Doubles Club",
    sport: "Tennis",
    currentMembers: 6,
    maxMembers: 8,
    location: "Riverside Tennis Club",
    ageGroup: "36-45",
    skillLevel: "advanced",
    nextGame: "Sunday 10:00 AM",
    description: "Competitive doubles matches. Looking for experienced players.",
    equipment: "Court fees shared",
    ads: [
      { company: "Wilson", product: "Tennis Rackets", discount: "25% off" },
      { company: "HEAD", product: "Tennis Balls", discount: "Buy 2 get 1 free" }
    ]
  }
];

export default function FindTeammates() {
  const [selectedSport, setSelectedSport] = useState<string>("");
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>("");
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>("");
  const [searchLocation, setSearchLocation] = useState<string>("");

  const filteredTeams = sampleTeams.filter(team => {
    return (
      (!selectedSport || team.sport === selectedSport) &&
      (!selectedAgeGroup || team.ageGroup === selectedAgeGroup) &&
      (!selectedSkillLevel || team.skillLevel === selectedSkillLevel) &&
      (!searchLocation || team.location.toLowerCase().includes(searchLocation.toLowerCase()))
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center space-x-3">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <i className="fas fa-users-line text-white text-2xl"></i>
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Find Your Sports Team</h1>
        </div>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          Join local sports teams, form new groups, and discover teammates in your area. From soccer to basketball, find your perfect match!
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <i className="fas fa-filter text-green-500"></i>
            <span>Filter Teams</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Select value={selectedSport} onValueChange={setSelectedSport}>
              <SelectTrigger data-testid="select-sport">
                <SelectValue placeholder="Select Sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Sports</SelectItem>
                <SelectItem value="Soccer">Soccer</SelectItem>
                <SelectItem value="Basketball">Basketball</SelectItem>
                <SelectItem value="Tennis">Tennis</SelectItem>
                <SelectItem value="Volleyball">Volleyball</SelectItem>
                <SelectItem value="Baseball">Baseball</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedAgeGroup} onValueChange={setSelectedAgeGroup}>
              <SelectTrigger data-testid="select-age-group">
                <SelectValue placeholder="Age Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Ages</SelectItem>
                <SelectItem value="18-25">18-25 years</SelectItem>
                <SelectItem value="26-35">26-35 years</SelectItem>
                <SelectItem value="36-45">36-45 years</SelectItem>
                <SelectItem value="46-55">46-55 years</SelectItem>
                <SelectItem value="56-65">56-65 years</SelectItem>
                <SelectItem value="65+">65+ years</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSkillLevel} onValueChange={setSelectedSkillLevel}>
              <SelectTrigger data-testid="select-skill-level">
                <SelectValue placeholder="Skill Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="mixed">Mixed Levels</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Location (e.g., NYC, Brooklyn)"
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              data-testid="input-location"
            />
          </div>
        </CardContent>
      </Card>

      {/* Create Team CTA */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Can't find your perfect team?</h3>
            <p className="text-slate-600">Create your own sports team and invite others to join!</p>
          </div>
          <Button className="bg-green-500 hover:bg-green-600" data-testid="button-create-team">
            <i className="fas fa-plus mr-2"></i>
            Create New Team
          </Button>
        </div>
      </div>

      {/* Teams List */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">Available Teams ({filteredTeams.length})</h2>
        <div className="grid lg:grid-cols-2 gap-6">
          {filteredTeams.map((team) => (
            <Card key={team.id} className="hover:shadow-lg transition-all duration-300" data-testid={`team-card-${team.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-xl">{team.name}</CardTitle>
                    <div className="flex items-center space-x-4">
                      <Badge className="bg-green-100 text-green-800">{team.sport}</Badge>
                      <Badge variant="outline">{team.ageGroup} years</Badge>
                      <Badge variant="outline">{team.skillLevel}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Members</p>
                    <p className="text-xl font-bold text-green-600">{team.currentMembers}/{team.maxMembers}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">{team.description}</p>
                
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-map-marker-alt text-green-500"></i>
                    <span>{team.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-clock text-blue-500"></i>
                    <span>{team.nextGame}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <i className="fas fa-tshirt text-purple-500"></i>
                    <span>{team.equipment}</span>
                  </div>
                </div>

                {/* Equipment Ads */}
                <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm text-slate-900 flex items-center">
                    <i className="fas fa-shopping-tag text-yellow-500 mr-2"></i>
                    Exclusive Team Offers
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {team.ads.map((ad, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded p-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">{ad.company}</Badge>
                          <span>{ad.product}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-700 text-xs">{ad.discount}</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1" data-testid={`button-join-team-${team.id}`}>
                    <i className="fas fa-user-plus mr-2"></i>
                    Join Team
                  </Button>
                  <Button variant="outline" data-testid={`button-view-team-${team.id}`}>
                    <i className="fas fa-eye mr-2"></i>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Calendar Integration CTA */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-8 text-center space-y-4">
          <div className="flex justify-center items-center space-x-3 mb-4">
            <i className="fas fa-calendar-plus text-3xl text-blue-500"></i>
          </div>
          <h3 className="text-2xl font-bold text-slate-900">Never Miss a Game!</h3>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Sync team schedules with your calendar. Get automatic reminders for practices, games, and team events.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="bg-blue-500 hover:bg-blue-600" data-testid="button-sync-google-calendar">
              <i className="fab fa-google mr-2"></i>
              Sync Google Calendar
            </Button>
            <Button variant="outline" data-testid="button-sync-apple-calendar">
              <i className="fab fa-apple mr-2"></i>
              Sync Apple Calendar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}