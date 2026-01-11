

import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import FeaturedSection from './components/FeaturedSection';
import BottomNav from './components/BottomNav';
import Explore from './components/Explore';
import Map from './components/Map';
import Saved from './components/Saved';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import PartnerDashboard from './pages/PartnerDashboard';
import './App.css';
import { supabase } from './lib/supabaseClient';

import PlaceCard from './components/PlaceCard';
import Loader from './components/Loader';
import PlaceDetails from './components/PlaceDetails';
import EventsSection from './components/EventsSection';
import ChatBot from './components/ChatBot';

import { popularPlaces, allPlaces } from './data';


function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthRestoring, setIsAuthRestoring] = useState(true); // New state for initial check
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [userRole, setUserRole] = useState(() => {
    const saved = localStorage.getItem('userData');
    if (saved) {
      try {
        return JSON.parse(saved).role || 'user';
      } catch (e) { return 'user'; }
    }
    return 'user';
  });
  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem('userData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) { return null; }
    }
    return null;
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'home';
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [mapDestination, setMapDestination] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const [savedPlaceIds, setSavedPlaceIds] = useState(() => {
    const saved = localStorage.getItem('savedPlaces');
    return saved ? JSON.parse(saved) : [];
  });
  const [spots, setSpots] = useState(allPlaces);
  const [events, setEvents] = useState([]);

  // Fetch spots from Supabase
  const fetchSpots = async () => {
    try {
      if (!supabase) return;

      const { data, error } = await supabase
        .from('heritage_spots')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        // Map Supabase data to the application format
        const supabaseSpots = data.map(s => ({
          id: s.id,
          title: s.title,
          category: s.category || 'Hidden Gem',
          description: s.description,
          location: s.address || 'Mysuru',
          rating: 4.5, // Default for new spots
          coords: [s.location_lat || 12.3021, s.location_long || 76.6715],
          image: s.image_url || '/src/assets/mysore-palace-daytime.jpg',
          isVerified: s.is_verified
        }));

        // Merge Supabase spots with hardcoded spots
        setSpots([...supabaseSpots, ...allPlaces.filter(p => !supabaseSpots.some(s => s.title === p.title))]);
      }
    } catch (err) {
      console.error("Error fetching heritage spots:", err);
    }
  };

  // Fetch events from Supabase
  const fetchEvents = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('heritage_events')
        .select('*')
        .eq('status', 'active')
        .order('event_date', { ascending: true });

      if (error) throw error;
      if (data) setEvents(data);
    } catch (err) {
      console.error("Error fetching heritage events:", err);
    }
  };

  React.useEffect(() => {
    fetchSpots();
    fetchEvents();
  }, []);

  // Persist Tab
  React.useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Handle dark mode persistence
  React.useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  React.useEffect(() => {
    localStorage.setItem('savedPlaces', JSON.stringify(savedPlaceIds));
  }, [savedPlaceIds]);

  // Initial Auth Check
  React.useEffect(() => {
    // const savedUser = localStorage.getItem('userData');
    // if (savedUser) {
    //   try {
    //     const parsedUser = JSON.parse(savedUser);
    //     setUserData(parsedUser);
    //     setUserRole(parsedUser.role || 'user');
    //     setIsAuthenticated(true);
    //   } catch (err) {
    //     console.error('Failed to restore session', err);
    //   }
    // }
    setIsAuthRestoring(false); // Auth restoration attempt complete
  }, []);

  const [_session, setSession] = useState(null);

  const fetchProfile = async (userId, email) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.warn('Profile sync: using current details or defaults');
        return;
      }

      if (data) {
        const updatedUser = {
          ...data,
          fullName: data.full_name || data.fullName,
          email: email || data.email,
          phone: data.phone || 'N/A',
          role: data.role || 'user'
        };
        setUserData(updatedUser);
        setUserRole(updatedUser.role);
        setIsAuthenticated(true);
        localStorage.setItem('userData', JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error('Profile sync failed', err);
    }
  };

  const fetchSavedPlaces = async (userId) => {
    try {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('saved_places')
        .select('spot_id')
        .eq('user_id', userId);

      if (error) throw error;
      if (data) {
        setSavedPlaceIds(data.map(item => item.spot_id));
      }
    } catch (err) {
      console.error('Failed to fetch saved places', err);
    }
  };

  React.useEffect(() => {
    if (!supabase) return;

    // 1. Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        fetchProfile(session.user.id, session.user.email);
      }
    });

    // 2. Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (newSession) {
        setSession(newSession);
        fetchProfile(newSession.user.id, newSession.user.email);
        fetchSavedPlaces(newSession.user.id);
      } else if (event === 'SIGNED_OUT') {
        // Only clear if it's an explicit sign out event
        setIsAuthenticated(false);
        setUserData(null);
        setUserRole('user');
        localStorage.removeItem('userData');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleSave = async (e, id) => {
    e.stopPropagation(); // Prevent card click

    // Check if ID is a valid UUID (database entries) or a local string
    const isLocalId = !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    if (isAuthenticated && userData?.id && !isLocalId) {
      const isAlreadySaved = savedPlaceIds.includes(id);
      try {
        if (isAlreadySaved) {
          const { error } = await supabase
            .from('saved_places')
            .delete()
            .eq('user_id', userData.id)
            .eq('spot_id', id);
          if (error) throw error;
          setSavedPlaceIds(prev => prev.filter(pId => pId !== id));
        } else {
          const { error } = await supabase
            .from('saved_places')
            .insert([{ user_id: userData.id, spot_id: id }]);
          if (error) throw error;
          setSavedPlaceIds(prev => [...prev, id]);
        }
      } catch (err) {
        console.error("Supabase toggle save failed:", err);
        // Fallback to local state if DB fails
        setSavedPlaceIds(prev =>
          prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        );
      }
    } else {
      // Local Guest fallback
      setSavedPlaceIds(prev =>
        prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
      );
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    // Always clear localStorage on logout
    localStorage.removeItem('userData');
    localStorage.removeItem('activeTab');
    localStorage.removeItem('theme');
    setIsAuthenticated(false);
    setUserData(null);
    setUserRole('user');
    setIsSignUp(false); // Ensure we return to login page, not signup
    setActiveTab('home');
  };

  const handleLogin = (role, userProfile) => {
    // Optimistic update if passed from LoginPage
    if (userProfile) {
      const normalizedProfile = {
        ...userProfile,
        fullName: userProfile.fullName || userProfile.full_name,
        role: role
      };
      setUserData(normalizedProfile);
      setUserRole(role);
      setIsLoading(true); // Trigger premium loader
      setIsAuthenticated(true);
      localStorage.setItem('userData', JSON.stringify(normalizedProfile));
    }
  };

  const handleSignUp = (role, userProfile) => {
    if (userProfile) {
      const normalizedProfile = {
        ...userProfile,
        fullName: userProfile.fullName || userProfile.full_name,
        role: role || userProfile.role || 'user'
      };
      setUserData(normalizedProfile);
      setUserRole(role || normalizedProfile.role || 'user');
      localStorage.setItem('userData', JSON.stringify(normalizedProfile));
    } else {
      setUserRole(role || 'user');
    }
    setIsLoading(true); // Trigger premium loader
    setIsAuthenticated(true);
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setActiveTab('details');
  };

  const updateUserProfile = async (updates) => {
    try {
      if (supabase && userData?.id) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', userData.id);
        if (error) throw error;
      }

      // Update local state and storage
      const updatedUser = { ...userData, ...updates };
      setUserData(updatedUser);
      localStorage.setItem('userData', JSON.stringify(updatedUser));
      return { success: true };
    } catch (err) {
      console.error('Update profile failed', err);
      return { success: false, error: err.message };
    }
  };

  const handleFeaturedCardClick = (place) => {
    handlePlaceClick(place);
  };

  if (isLoading) {
    return <Loader onFinish={() => setIsLoading(false)} />;
  }

  if (!isAuthenticated) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onSignUp={handleSignUp}
      />
    );
  }

  if (userRole === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (userRole === 'partner') {
    return <PartnerDashboard onLogout={handleLogout} partnerData={userData} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <PlaceDetails
            place={selectedPlace}
            onBack={() => setActiveTab('home')}
            isSaved={savedPlaceIds.includes(selectedPlace?.id)}
            onToggleSave={toggleSave}
            userEmail={userData?.email}
            onGetDirections={(place) => {
              setMapDestination(place);
              setActiveTab('map');
            }}
          />
        );
      case 'home':
        return (
          <>
            <Hero onExploreClick={() => setActiveTab('explore')} />
            <Categories onSeeAllClick={() => setActiveTab('explore')} />
            <FeaturedSection
              places={spots}
              onCardClick={handleFeaturedCardClick}
              savedPlaceIds={savedPlaceIds}
              onToggleSave={toggleSave}
              onSeeAllClick={() => setActiveTab('map')}
            />
            <EventsSection events={events} />
          </>
        );
      case 'explore':
        return (
          <Explore
            places={spots}
            savedPlaceIds={savedPlaceIds}
            onToggleSave={toggleSave}
            onCardClick={handlePlaceClick}
          />
        );
      case 'map':
        return <Map places={spots} destination={mapDestination} />;
      case 'saved':
        return (
          <Saved
            savedPlaceIds={savedPlaceIds}
            allPlaces={spots}
            onToggleSave={toggleSave}
            onCardClick={handlePlaceClick}
          />
        );
      case 'profile':
        return (
          <ProfilePage
            userData={userData}
            onUpdateProfile={updateUserProfile}
            savedPlaceIds={savedPlaceIds}
            allPlaces={spots}
            onBack={() => setActiveTab('home')}
            isDarkMode={isDarkMode}
            onToggleDarkMode={toggleDarkMode}
            onLogout={handleLogout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-mysore-light dark:bg-mysore-dark transition-colors duration-200 selection:bg-[#D4AF37]/30 flex flex-col">
      {!supabase && (
        <div className="bg-red-500 text-white text-[10px] py-1 px-4 text-center font-bold animate-pulse z-50">
          ⚠️ DEMO MODE: Supabase not connected. Check your .env file!
        </div>
      )}

      {activeTab !== 'profile' && activeTab !== 'details' && (
        <div className="sticky top-0 z-40 bg-mysore-light/80 dark:bg-mysore-dark/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800">
          <div className="max-w-7xl mx-auto w-full">
            <Navbar
              onProfileClick={() => setActiveTab('profile')}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </div>
        </div>
      )}

      <div className={`flex-1 ${activeTab !== 'map' && activeTab !== 'details' ? 'overflow-y-auto pb-24 md:pb-0 custom-scrollbar' : 'overflow-hidden h-[calc(100vh-64px)]'}`}>
        <div className="max-w-7xl mx-auto w-full h-full">
          {renderContent()}
        </div>
      </div>

      {activeTab !== 'profile' && activeTab !== 'details' && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      )}

      {/* ChatBot - Available on all user pages */}
      {isAuthenticated && userRole === 'user' && activeTab !== 'profile' && activeTab !== 'details' && (
        <ChatBot />
      )}
    </div>
  );
}

export default App;
