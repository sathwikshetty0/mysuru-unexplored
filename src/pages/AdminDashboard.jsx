import React, { useState, useEffect } from 'react';
import { Users, Map, BarChart3, LogOut, Shield, Search, Star, MessageSquare, Inbox, Check, X, Clock, Handshake, TrendingUp, Settings, Bell, Lock, Globe, Database, ExternalLink, Download, Trash2, RefreshCcw } from 'lucide-react';
import { allPlaces } from '../data';
import MapComponent from '../components/Map';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [userFilter, setUserFilter] = useState('all'); // 'all', 'user', 'partner'
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adminSettings, setAdminSettings] = useState({
        publicRegistration: true,
        partnerVerification: true,
        globalBroadcasts: true
    });
    const [siteFeedback, setSiteFeedback] = useState([]);
    const [spotsCount, setSpotsCount] = useState(allPlaces.length);
    const [confirmModal, setConfirmModal] = useState({ show: false, title: '', message: '', onConfirm: null, type: 'danger' });
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

    // Load users from Supabase
    const loadUsers = async () => {
        setLoading(true);
        try {
            const { supabase } = await import('../lib/supabaseClient');

            if (supabase) {
                // Fetch all profiles from the custom table we created
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .order('updated_at', { ascending: false });

                if (!error && data) {
                    const supabaseUsers = data.map(u => ({
                        fullName: u.full_name || u.fullName || 'Resident',
                        email: u.email,
                        phone: u.phone || '–',
                        role: u.role || 'user',
                        joinedAt: u.updated_at || u.created_at,
                        source: 'Supabase'
                    }));
                    setUsers(supabaseUsers);
                } else {
                    console.error("Supabase fetch error:", error);
                    // Fallback to local if Supabase fails or table doesn't exist yet
                    const storedUsers = localStorage.getItem('usersDB');
                    if (storedUsers) setUsers(JSON.parse(storedUsers));
                }
            } else {
                // Pure demo mode fallback
                const storedUsers = localStorage.getItem('usersDB');
                if (storedUsers) setUsers(JSON.parse(storedUsers));
            }
        } catch (error) {
            console.error("Critical failure loading users", error);
        }
        setLoading(false);
    };

    const loadSpotsCount = async () => {
        try {
            const { supabase } = await import('../lib/supabaseClient');
            if (supabase) {
                const { count, error } = await supabase
                    .from('heritage_spots')
                    .select('*', { count: 'exact', head: true });

                if (!error && count !== null) {
                    setSpotsCount(count);
                }
            }
        } catch (err) {
            console.error("Error loading spots count:", err);
        }
    };

    const loadFeedback = async () => {
        try {
            const { supabase } = await import('../lib/supabaseClient');
            if (supabase) {
                const { data, error } = await supabase
                    .from('admin_feedback')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (data) {
                    setSiteFeedback(data.map(f => ({
                        id: f.id,
                        userEmail: f.email || 'Anonymous Traveler',
                        rating: f.rating,
                        comment: f.comment,
                        timestamp: f.created_at
                    })));
                }
            }
        } catch (err) {
            console.error("Error loading feedback:", err);
        }
    };

    useEffect(() => {
        loadUsers();
        loadFeedback();
        loadSpotsCount();
    }, []);

    const totalUsers = users.length;
    const partnersCount = users.filter(u => u.role === 'partner').length;

    const handleTabChange = (tab, filter = 'all') => {
        setActiveTab(tab);
        setUserFilter(filter);
    };

    const handleDeleteUser = async (email) => {
        setConfirmModal({
            show: true,
            title: 'Remove Resident',
            message: `Are you sure you want to remove ${email} from the registry? This action cannot be undone.`,
            type: 'danger',
            onConfirm: async () => {
                try {
                    const { supabase } = await import('../lib/supabaseClient');

                    // 1. Delete from Supabase profiles table
                    if (supabase) {
                        const { error } = await supabase
                            .from('profiles')
                            .delete()
                            .eq('email', email);

                        if (error) {
                            console.error("Supabase deletion error:", error.message);
                        }
                    }

                    // 2. Fallback/Cleanup for Local Storage
                    const storedUsers = JSON.parse(localStorage.getItem('usersDB') || '[]');
                    const updatedUsers = storedUsers.filter(u => u.email !== email);
                    localStorage.setItem('usersDB', JSON.stringify(updatedUsers));

                    // 3. Update UI State
                    setUsers(prev => prev.filter(u => u.email !== email));
                    showNotification(`${email} has been removed.`);
                } catch (err) {
                    console.error("Critical error during deletion:", err);
                    showNotification("Deletion failed.", "error");
                }
                setConfirmModal(prev => ({ ...prev, show: false }));
            }
        });
    };

    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 3000);
    };

    const toggleSetting = (key) => {
        setAdminSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleReset = () => {
        setConfirmModal({
            show: true,
            title: 'System Reset',
            message: 'CRITICAL ACTION: This will reset all administrative overrides. Are you absolutely sure?',
            type: 'danger',
            onConfirm: () => {
                showNotification("System state normalized.");
                setConfirmModal(prev => ({ ...prev, show: false }));
            }
        });
    };

    return (
        <div className="min-h-screen bg-mysore-light dark:bg-mysore-dark font-sans transition-colors duration-500 flex selection:bg-[#D4AF37]/30">
            {/* Sidebar */}
            <aside className="fixed inset-y-0 left-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-2xl w-72 border-r border-gray-100 dark:border-gray-800 shadow-2xl z-30 hidden lg:flex flex-col">
                <div className="p-10 flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#D4AF37] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
                        <Shield className="h-6 w-6 text-black" />
                    </div>
                    <div>
                        <h1 className="text-xl font-serif text-black dark:text-white leading-none">Mysuru</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Administration</p>
                    </div>
                </div>

                <nav className="flex-1 px-6 space-y-3">
                    <NavItem icon={<TrendingUp />} label="Overview" active={activeTab === 'overview'} onClick={() => handleTabChange('overview')} />
                    <NavItem icon={<Users />} label="Residents" active={activeTab === 'users'} onClick={() => handleTabChange('users', 'all')} />
                    <NavItem icon={<Inbox />} label="Invitations" active={activeTab === 'invites'} onClick={() => handleTabChange('invites')} />
                    <NavItem icon={<Settings />} label="Settings" active={activeTab === 'settings'} onClick={() => handleTabChange('settings')} />
                </nav>

                <div className="p-8">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-4 w-full px-6 py-4 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all font-bold text-sm"
                    >
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="lg:ml-72 flex-1 h-screen overflow-y-auto custom-scrollbar">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#D4AF37] rounded-lg flex items-center justify-center">
                            <Shield className="h-5 w-5 text-black" />
                        </div>
                        <span className="font-serif text-lg text-black dark:text-white">Admin Core</span>
                    </div>
                    <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-500">
                        <LogOut className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-8 lg:p-12 max-w-7xl mx-auto">
                    {activeTab === 'overview' && (
                        <OverviewTab
                            totalUsers={totalUsers}
                            partnersCount={partnersCount}
                            activeLocations={spotsCount}
                            siteFeedback={siteFeedback}
                            onNavigate={handleTabChange}
                        />
                    )}
                    {activeTab === 'users' && (
                        <UsersTab
                            users={users}
                            loading={loading}
                            filter={userFilter}
                            setFilter={setUserFilter}
                            onDeleteUser={handleDeleteUser}
                        />
                    )}
                    {activeTab === 'invites' && (
                        <InvitationsTab showNotification={showNotification} />
                    )}
                    {activeTab === 'settings' && (
                        <SettingsTab settings={adminSettings} onToggle={toggleSetting} loadUsers={loadUsers} handleReset={handleReset} />
                    )}
                </div>
            </main>

            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-0">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}></div>
                    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-8 sm:p-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${confirmModal.type === 'danger' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                                <Shield className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-serif text-black dark:text-white mb-3">{confirmModal.title}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">{confirmModal.message}</p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                                    className="flex-1 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-black dark:hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmModal.onConfirm}
                                    className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl transition-all hover:scale-105 active:scale-95 ${confirmModal.type === 'danger' ? 'bg-rose-500 text-white shadow-rose-500/20' : 'bg-black dark:bg-[#D4AF37] text-white dark:text-black shadow-black/20'}`}
                                >
                                    Confirm Action
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Premium Toast Notification */}
            {notification.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[101] animate-in slide-in-from-bottom-10 duration-500">
                    <div className="bg-black dark:bg-gray-800 text-white px-8 py-4 rounded-[1.5rem] shadow-2xl flex items-center gap-4 border border-white/10">
                        <div className={`w-2 h-2 rounded-full ${notification.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`}></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{notification.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const NavItem = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${active
            ? 'bg-black dark:bg-[#D4AF37] text-white dark:text-black shadow-xl shadow-black/10 dark:shadow-[#D4AF37]/20 scale-[1.02]'
            : 'text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800/50 hover:text-black dark:hover:text-white'
            }`}>
        {React.cloneElement(icon, { size: 20 })}
        <span className="font-bold text-sm">{label}</span>
    </button>
);

const StatCard = ({ title, value, change, icon, bg, onClick }) => (
    <button
        onClick={onClick}
        className="text-left w-full bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-800 hover:scale-[1.02] transition-all group"
    >
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${bg} group-hover:scale-110 transition-transform duration-500`}>
                {icon}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-black">
                <TrendingUp size={12} />
                <span>{change}</span>
            </div>
        </div>
        <h3 className="text-4xl font-serif text-black dark:text-white mb-2 leading-none">{value}</h3>
        <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
    </button>
);

const OverviewTab = ({ totalUsers, partnersCount, activeLocations, siteFeedback, onNavigate }) => (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header>
            <h2 className="text-5xl font-serif text-black dark:text-white leading-tight">Welcome Back</h2>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard
                title="Total Residents"
                value={totalUsers}
                change="+12.4%"
                icon={<Users className="h-7 w-7 text-blue-600" />}
                bg="bg-blue-100 dark:bg-blue-900/30"
                onClick={() => onNavigate('users', 'user')}
            />
            <StatCard
                title="Verified Heritage Spots"
                value={activeLocations}
                change="+5.2%"
                icon={<Map className="h-7 w-7 text-emerald-600" />}
                bg="bg-emerald-100 dark:bg-emerald-900/30"
            />
            <StatCard
                title="Active Partners"
                value={partnersCount}
                change="+24.8%"
                icon={<BarChart3 className="h-7 w-7 text-amber-600" />}
                bg="bg-amber-100 dark:bg-amber-900/30"
                onClick={() => onNavigate('users', 'partner')}
            />
        </div>

        {/* Heritage Pulse Map Integration */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h3 className="text-2xl font-serif text-black dark:text-white">Live Heritage Pulse</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-2">Real-time spatial activity across Mysuru</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">System Nominal</span>
                </div>
            </div>

            <div className="h-[450px] rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-700 relative shadow-inner group">
                <MapComponent />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="absolute bottom-8 left-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 pointer-events-none opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                    <p className="text-white text-xs font-bold uppercase tracking-widest leading-relaxed">Global Heritage Node Override Active</p>
                </div>
            </div>
        </div>

        {/* Recent Feedback Section */}
        <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                    <MessageSquare className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-2xl font-serif text-black dark:text-white">Recent Feedback</h3>
                </div>
            </div>

            <div className="space-y-6">
                {(() => {
                    const feedback = siteFeedback;
                    if (feedback.length === 0) {
                        return (
                            <div className="py-12 text-center border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem]">
                                <p className="text-gray-400 font-serif italic">Silence in the halls of feedback...</p>
                            </div>
                        );
                    }
                    return feedback.slice(0, 5).map((item) => (
                        <div key={item.id} className="bg-white dark:bg-gray-800/40 p-6 rounded-[2rem] border border-gray-50 dark:border-gray-700/50 hover:scale-[1.01] transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 font-black text-sm">
                                        {item.userEmail.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-black dark:text-white">{item.userEmail}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(item.timestamp).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-amber-500">
                                    <Star size={12} fill="currentColor" />
                                    <span className="text-sm font-black">{item.rating}</span>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm italic leading-relaxed">"{item.comment}"</p>
                        </div>
                    ));
                })()}
            </div>
        </div>
    </div>
);

const UsersTab = ({ users, filter, setFilter, onDeleteUser }) => {
    const filteredUsers = (filter === 'all'
        ? [...users]
        : users.filter(user => user.role === filter))
        .sort((a, b) => new Date(b.joinedAt || 0) - new Date(a.joinedAt || 0));

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-3">Resident Management</p>
                    <h2 className="text-4xl font-serif text-black dark:text-white capitalize">
                        {filter === 'all' ? 'The Collective' : `${filter} Directory`}
                    </h2>
                </div>

                <div className="flex flex-wrap gap-2 p-1.5 bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-100 dark:border-gray-700">
                    {['all', 'user', 'partner', 'admin'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${filter === f
                                ? 'bg-black dark:bg-[#D4AF37] text-white dark:text-black shadow-lg'
                                : 'text-gray-400 hover:text-black dark:hover:text-white'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </header>

            <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[3rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Identity</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Role</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Contact</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Date</th>
                                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {filteredUsers.map((user, index) => (
                                <tr key={index} className="group hover:bg-white dark:hover:bg-gray-800/80 transition-colors">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="h-14 w-14 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] font-black text-xl shadow-inner">
                                                {user.fullName ? user.fullName.charAt(0).toUpperCase() : '?'}
                                            </div>
                                            <div>
                                                <div className="font-serif text-lg text-black dark:text-white leading-tight mb-1">{user.fullName}</div>
                                                <div className="text-xs text-gray-400 font-medium lowercase tracking-tighter">{user.email || 'No email'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest
                                        ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600' :
                                                user.role === 'partner' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' :
                                                    'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600'}`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="text-xs font-bold text-gray-500">{user.phone || '–'}</div>
                                    </td>
                                    <td className="px-10 py-8 text-xs font-bold text-gray-400">
                                        {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Heritage Epoch'}
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <button
                                            onClick={() => onDeleteUser(user.email)}
                                            className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                                        >
                                            <X size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


const InvitationsTab = ({ showNotification }) => {
    const [invites, setInvites] = useState([]);

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        let allApps = [];

        // 1. Try Supabase
        try {
            const { supabase } = await import('../lib/supabaseClient');
            if (supabase) {
                const { data, error } = await supabase
                    .from('partner_applications')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    allApps = data.map(inv => ({
                        id: inv.id,
                        partnerName: inv.full_name,
                        partnerEmail: inv.email,
                        spotName: inv.spot_name,
                        status: inv.status,
                        timestamp: inv.created_at,
                        source: 'cloud'
                    }));
                }
            }
        } catch (err) {
            console.warn("Supabase fetch failed for apps:", err);
        }

        // 2. Load Local Invites
        const local = JSON.parse(localStorage.getItem('collaboration_invites') || '[]');
        const localApps = local.map(inv => ({
            ...inv,
            source: 'local',
            // Ensure schema compatibility
            partnerName: inv.partnerName || inv.full_name,
            partnerEmail: inv.partnerEmail || inv.email,
            timestamp: inv.timestamp || inv.created_at
        }));

        // 3. Merge
        const combined = [...allApps, ...localApps].sort((a, b) =>
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        setInvites(combined);
    };

    const handleStatusUpdate = async (invite, newStatus) => {
        try {
            const { supabase } = await import('../lib/supabaseClient');

            // 1. Update Cloud (if applicable)
            if (supabase && invite.source === 'cloud') {
                const { error: updateError } = await supabase
                    .from('partner_applications')
                    .update({ status: newStatus })
                    .eq('id', invite.id);

                if (updateError) throw updateError;
            }

            // 2. Update Local (always, to be safe or if local source)
            const local = JSON.parse(localStorage.getItem('collaboration_invites') || '[]');
            const updatedLocal = local.map(inv => {
                if (inv.id === invite.id || inv.partnerEmail === invite.partnerEmail) {
                    return { ...inv, status: newStatus };
                }
                return inv;
            });
            localStorage.setItem('collaboration_invites', JSON.stringify(updatedLocal));

            // 3. Update UI state
            setInvites(prev => prev.map(inv =>
                (inv.id === invite.id) ? { ...inv, status: newStatus } : inv
            ));

            // 4. If accepted, sync to the verified_partners table (Cloud)
            if (newStatus === 'accepted' && supabase) {
                await supabase
                    .from('verified_partners')
                    .upsert({
                        partner_name: invite.partnerName,
                        partner_email: invite.partnerEmail,
                        spot_name: invite.spotName,
                        category: invite.category || 'Heritage',
                        status: 'verified'
                    }, { onConflict: 'partner_email' });
            }
            showNotification(`Application ${newStatus}.`);
        } catch (err) {
            console.error("Error updating status:", err);
            showNotification("Protocol update failed.", "error");
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-3">Partnership Protocol</p>
                <h2 className="text-5xl font-serif text-black dark:text-white truncate">Collaboration Requests</h2>
            </header>

            <div className="grid grid-cols-1 gap-6">
                {invites.length === 0 ? (
                    <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] p-24 text-center border border-dashed border-gray-200 dark:border-gray-800">
                        <Inbox size={64} className="mx-auto text-gray-200 dark:text-gray-700 mb-6" />
                        <p className="text-gray-400 font-serif text-2xl italic tracking-wide">No petitioners at the gate...</p>
                    </div>
                ) : (
                    invites.map(invite => (
                        <div key={invite.id} className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:scale-[1.01] transition-all duration-300">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 font-serif text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    {invite.partnerName ? invite.partnerName.charAt(0) : '?'}
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-2xl font-serif text-black dark:text-white">{invite.partnerName}</h4>
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${invite.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                            invite.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                                                'bg-rose-100 text-rose-600'
                                            }`}>
                                            {invite.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-col md:flex-row gap-4 text-xs font-bold text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <Handshake size={14} className="text-[#D4AF37]" />
                                            <span className="uppercase tracking-widest">{invite.spotName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span>{new Date(invite.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {invite.status === 'pending' && (
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleStatusUpdate(invite, 'rejected')}
                                        className="h-14 w-14 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(invite, 'accepted')}
                                        className="h-14 px-10 bg-black dark:bg-[#D4AF37] text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all"
                                    >
                                        Accept Invite
                                    </button>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const SettingsTab = ({ settings, onToggle, loadUsers }) => {
    const downloadCSV = (filename, content) => {
        const element = document.createElement('a');
        const file = new Blob([content], { type: 'text/csv' });
        element.href = URL.createObjectURL(file);
        element.download = filename;
        document.body.appendChild(element);
        element.click();
    };

    const handleExportUsers = () => {
        const users = JSON.parse(localStorage.getItem('usersDB') || '[]');
        if (!users.length) {
            alert('No residents found in registry.');
            return;
        }

        // Sanitize data: Remove sensitive fields like passwords
        const sanitizedUsers = users.map(({ password, confirmPassword, ...rest }) => rest);

        const headers = Object.keys(sanitizedUsers[0]).join(',');
        const rows = sanitizedUsers.map(u => Object.values(u).map(v => `"${v}"`).join(',')).join('\n');
        downloadCSV('mysuru_residents.csv', headers + '\n' + rows);
    };

    const handleClearCache = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-3">Core Configuration</p>
                <h2 className="text-5xl font-serif text-black dark:text-white truncate">Administrative Settings</h2>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Governance (State Toggles) */}
                <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl">
                            <Shield className="h-6 w-6 text-amber-600" />
                        </div>
                        <h3 className="text-xl font-serif text-black dark:text-white">General Governance</h3>
                    </div>
                    {/* Keeps existing toggles */}
                    <div className="space-y-4">
                        <AdminSettingItem icon={<Globe />} label="Public Registration" description="Allow new user identities" checked={settings.publicRegistration} onToggle={() => onToggle('publicRegistration')} />
                        <AdminSettingItem icon={<Lock />} label="Partner Verification" description="Require manual approval" checked={settings.partnerVerification} onToggle={() => onToggle('partnerVerification')} />
                        <AdminSettingItem icon={<Bell />} label="Global Broadcasts" description="Enable announcements" checked={settings.globalBroadcasts} onToggle={() => onToggle('globalBroadcasts')} />
                    </div>
                </div>

                {/* Data Actions (New) */}
                <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl rounded-[2.5rem] p-10 border border-gray-100 dark:border-gray-800 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl">
                            <Database className="h-6 w-6 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-serif text-black dark:text-white">Data Management</h3>
                    </div>

                    <div className="space-y-4">
                        <button onClick={handleExportUsers} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all group">
                            <div className="flex items-center gap-4">
                                <Download className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" size={20} />
                                <div className="text-left">
                                    <h4 className="text-sm font-bold text-black dark:text-white">Export Registry</h4>
                                    <p className="text-[10px] text-gray-400 font-medium">Download resident data (CSV)</p>
                                </div>
                            </div>
                        </button>

                        <button onClick={loadUsers} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl hover:bg-white dark:hover:bg-gray-800 transition-all group">
                            <div className="flex items-center gap-4">
                                <RefreshCcw className="text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors" size={20} />
                                <div className="text-left">
                                    <h4 className="text-sm font-bold text-black dark:text-white">Refresh Nodes</h4>
                                    <p className="text-[10px] text-gray-400 font-medium">Re-synchronize with database</p>
                                </div>
                            </div>
                        </button>

                        <button onClick={handleClearCache} className="w-full flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/10 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all group border border-transparent hover:border-red-200">
                            <div className="flex items-center gap-4">
                                <Trash2 className="text-red-400 group-hover:text-red-600 transition-colors" size={20} />
                                <div className="text-left">
                                    <h4 className="text-sm font-bold text-red-600 dark:text-red-400">Purge Local Cache</h4>
                                    <p className="text-[10px] text-red-400/70 font-medium">Clear app state & logout</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminSettingItem = ({ icon, label, description, checked, onToggle }) => (
    <div
        onClick={onToggle}
        className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/40 rounded-2xl transition-all cursor-pointer"
    >
        <div className="flex items-center gap-4">
            <div className="text-gray-400">{icon}</div>
            <div>
                <h4 className="text-sm font-bold text-black dark:text-white">{label}</h4>
                <p className="text-[10px] text-gray-400 font-medium">{description}</p>
            </div>
        </div>
        <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-black dark:bg-[#D4AF37]' : 'bg-gray-200 dark:bg-gray-800'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all duration-300 ${checked ? 'translate-x-7' : 'translate-x-1'}`}></div>
        </div>
    </div>
);

export default AdminDashboard;
