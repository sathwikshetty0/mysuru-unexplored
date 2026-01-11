import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, Mail, Phone, Shield, Handshake } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const AuthPage = ({ onLogin, onSignUp }) => {
    const [isSignUp, setIsSignUp] = useState(false);

    // Login State
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [loginError, setLoginError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // Sign-Up State
    const [signUpData, setSignUpData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: 'user',
        agreeToTerms: false
    });
    const [signUpErrors, setSignUpErrors] = useState({});
    const [showSignUpPassword, setShowSignUpPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // --- Login Handlers ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setLoginError('');
        setIsLoggingIn(true);

        // 1. Quick Testing Credentials (REMOVED FOR SECURITY)
        // Hardcoded backdoors have been removed to ensure production security.


        // 2. Local Registry Check (Username support)
        const usersDB = JSON.parse(localStorage.getItem('usersDB') || '[]');
        const localUser = usersDB.find(u => u.email === loginIdentifier || u.fullName.toLowerCase() === loginIdentifier.toLowerCase());

        // SECURITY NOTICE: This logic allowed password-less login for local usernames.
        // It has been disabled to ensure the website is safe.
        /*
        // If it's a username login or known local user, let them in immediately
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier);
        if (!isEmail && localUser) {
            localStorage.setItem('userData', JSON.stringify(localUser));
            onLogin(localUser.role, localUser);
            setIsLoggingIn(false);
            return;
        }
        */

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginIdentifier);

        // 3. Supabase Cloud Check
        if (supabase) {
            if (!isEmail) {
                setLoginError('Security Update: Please use your Email Address to log in. Username login is no longer supported.');
                setIsLoggingIn(false);
                return;
            }

            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: loginIdentifier,
                    password: loginPassword
                });

                if (!error && data.user) {
                    const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
                    const role = profile?.role || 'user';
                    onLogin(role, { ...profile, email: data.user.email });
                    setIsLoggingIn(false);
                    return;
                }
            } catch (err) {
                console.error("Cloud login attempt failed");
            }
        }

        // 4. Final Fallback (For unverified Supabase emails stored locally)
        // 4. Fallback: If Supabase login failed or wasn't available, we CANNOT verify password locally anymore.
        // We only allow login if Supabase verified it, OR if we are in a pure offline demo mode where we don't check security.
        // However, for strict security requested by USER, we should not allow fallback login if Supabase exists.

        if (!supabase && localUser) {
            // DEMO MODE ONLY: If no Supabase client exists, allow simplistic login
            localStorage.setItem('userData', JSON.stringify(localUser));
            onLogin(localUser.role, localUser);
        } else if (localUser && !supabase) {
            // This branch is redundant but keeps logic clear: if Supabase exists, we already tried and failed above.
            // So we do NOT allow local password check because we deleted local passwords.
        } else {
            setLoginError('No account found or incorrect credentials.');
        }
        setIsLoggingIn(false);
    };

    // --- Sign-Up Handlers ---
    const validateSignUp = () => {
        const newErrors = {};
        if (!signUpData.fullName.trim()) newErrors.fullName = 'Required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!signUpData.email || !emailRegex.test(signUpData.email)) newErrors.email = 'Invalid email';
        if (signUpData.password.length < 8) {
            newErrors.password = 'Min 8 chars';
        } else if (!/(?=.*[a-z])/.test(signUpData.password)) {
            newErrors.password = 'Need lowercase letter';
        } else if (!/(?=.*[A-Z])/.test(signUpData.password)) {
            newErrors.password = 'Need uppercase letter';
        } else if (!/(?=.*\d)/.test(signUpData.password)) {
            newErrors.password = 'Need a number';
        } else if (!/(?=.*[@$!%*?&#])/.test(signUpData.password)) {
            newErrors.password = 'Need special char (@$!%*?&#)';
        }
        if (signUpData.password !== signUpData.confirmPassword) newErrors.confirmPassword = 'No match';
        if (!signUpData.agreeToTerms) newErrors.agreeToTerms = 'Required';
        setSignUpErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const [verificationSent, setVerificationSent] = useState(false);

    const handleSignUpSubmit = async (e) => {
        e.preventDefault();
        if (!validateSignUp()) return;

        const newUser = {
            fullName: signUpData.fullName,
            email: signUpData.email,
            phone: signUpData.phone,
            // Password intentionally omitted for security - stored only in Supabase
            role: signUpData.role,
            joinedAt: new Date().toISOString(),
            status: 'Active'
        };

        /* LEGACY LOCAL STORAGE - DISABLED FOR SECURITY
        const usersDB = JSON.parse(localStorage.getItem('usersDB') || '[]');
        if (!usersDB.some(u => u.email === signUpData.email)) {
             usersDB.push(newUser);
             localStorage.setItem('usersDB', JSON.stringify(usersDB));
        }
        */

        if (!supabase) {
            localStorage.setItem('userData', JSON.stringify(newUser));
            onSignUp(signUpData.role, newUser);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email: signUpData.email,
                password: signUpData.password,
                options: { data: { full_name: signUpData.fullName, role: signUpData.role, phone: signUpData.phone } }
            });
            if (error) throw error;

            // If email confirmation is ON, session will be null
            if (data.user && !data.session) {
                setVerificationSent(true);
            } else if (data.session) {
                // If email confirmation is OFF, we get a session immediately
                onSignUp(signUpData.role, { full_name: signUpData.fullName, email: signUpData.email, phone: signUpData.phone, role: signUpData.role });
            }
        } catch (error) {
            console.error("Sign Up Error:", error);

            let displayError = error.message;
            if (error.message.includes("Database error")) {
                displayError = "System Update: We are upgrading our heritage registry. Please try again later.";
                console.warn("DEVELOPER NOTE: This error is likely coming from a Postgres Trigger in Supabase (e.g., 'handle_new_user'). Check if the Trigger is failing to insert into the 'profiles' table, possibly due to RLS policies or missing columns.");
            }

            setSignUpErrors(prev => ({ ...prev, submit: displayError }));
        }
    };

    const handleSignUpChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSignUpData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    return (
        <div className="min-h-screen bg-mysore-light dark:bg-mysore-dark flex items-center justify-center p-6 transition-colors duration-500 overflow-hidden font-sans">
            {/* Background Decorative Blurs */}
            <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#D4AF37]/20 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-black/10 rounded-full blur-[150px]"></div>
            </div>

            {/* Main Auth Container */}
            <div className={`relative w-full max-w-6xl h-[85vh] bg-white/70 dark:bg-gray-900/70 backdrop-blur-3xl rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-1000 border border-white/20 dark:border-gray-800`}>

                {/* Visual Branding Overlay (The Sliding Part) */}
                <div
                    className={`absolute top-0 bottom-0 z-30 w-full md:w-[60%] transition-all duration-1000 cubic-bezier(0.4, 0, 0.2, 1) transform overflow-hidden ${isSignUp ? 'translate-x-0 md:translate-x-[66.6%]' : 'translate-x-0 md:translate-x-0'
                        }`}
                >
                    <div className="absolute inset-0 z-40 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <img
                        src="/src/assets/mysore-palace-daytime.jpg"
                        alt="Mysore Palace"
                        className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[2500ms] ${isSignUp ? 'scale-125 md:translate-x-10' : 'scale-110 translate-x-0'}`}
                    />

                    <div className="absolute bottom-16 left-16 right-16 z-50 text-white">
                        <p className="text-sm font-bold uppercase tracking-[0.6em] text-[#D4AF37] mb-4 drop-shadow-md">Beyond the Palace</p>
                        <h2 className="text-5xl lg:text-7xl font-serif mb-8 drop-shadow-lg leading-tight">Discover the <br />Soul of Mysuru</h2>
                        <p className="text-lg text-gray-200 max-w-md drop-shadow-md font-light leading-relaxed opacity-90">
                            Uncover hidden gems, local artisans & authentic experiences that usually go unexplored.
                        </p>
                    </div>
                </div>

                {/* Form Panels Container */}
                <div className="relative w-full h-full flex flex-col md:flex-row">

                    {/* LEFT PANEL (Sign Up) */}
                    <div className={`w-full md:w-[40%] h-full flex items-center justify-center p-8 lg:p-16 transition-all duration-1000 ease-in-out ${isSignUp ? 'opacity-100 translate-x-0 z-20' : 'opacity-0 translate-x-20 pointer-events-none z-10'
                        }`}>
                        <div className="w-full max-w-sm">
                            <div className="mb-10">
                                <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-4">Create Account</h1>
                            </div>

                            {verificationSent ? (
                                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                                        <Mail className="w-10 h-10 text-emerald-600" />
                                    </div>
                                    <div className="space-y-4">
                                        <h2 className="text-3xl font-serif text-gray-900 dark:text-white">Heritage Registry Active</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                            Your account has been recorded in the Supabase database.
                                            A verification scroll was sent to <span className="font-bold text-gray-900 dark:text-white">{signUpData.email}</span>.
                                        </p>
                                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-800/20">
                                            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">Success</p>
                                            <p className="text-[10px] text-emerald-500 font-medium">Data preserved. You may proceed to explore while verification is pending.</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => {
                                                const newUser = {
                                                    fullName: signUpData.fullName,
                                                    email: signUpData.email,
                                                    phone: signUpData.phone,
                                                    role: signUpData.role,
                                                    joinedAt: new Date().toISOString(),
                                                };
                                                localStorage.setItem('userData', JSON.stringify(newUser));
                                                onSignUp(signUpData.role, newUser);
                                            }}
                                            className="w-full py-5 bg-black dark:bg-[#D4AF37] text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-all"
                                        >
                                            Proceed to Dashboard
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsSignUp(false);
                                                setVerificationSent(false);
                                            }}
                                            className="w-full py-5 border-2 border-gray-100 dark:border-gray-800 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
                                        >
                                            Sign In Manually
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <form onSubmit={handleSignUpSubmit} className="space-y-4">
                                        <div className="flex gap-4 mb-8">
                                            {['user', 'partner'].map(r => (
                                                <button
                                                    key={r}
                                                    type="button"
                                                    onClick={() => setSignUpData(prev => ({ ...prev, role: r }))}
                                                    className={`flex-1 flex items-center justify-center gap-3 py-4 px-4 rounded-2xl border transition-all duration-300 ${signUpData.role === r
                                                        ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/5 ring-1 ring-[#D4AF37]/20 shadow-sm'
                                                        : 'border-gray-200 dark:border-gray-800 text-gray-400 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-transparent'
                                                        }`}
                                                >
                                                    {r === 'user' ? <User size={18} strokeWidth={2} /> : <Handshake size={18} strokeWidth={2} />}
                                                    <span className="text-xs font-bold uppercase tracking-widest">{r}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#D4AF37] transition-colors" />
                                                <input type="text" name="fullName" value={signUpData.fullName} onChange={handleSignUpChange} placeholder="Full Name" className={`w-full pl-12 pr-4 py-4 border ${signUpErrors.fullName ? 'border-red-500' : 'border-gray-100 dark:border-gray-800'} rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-sm focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all`} />
                                                {signUpErrors.fullName && <p className="text-[10px] text-red-500 font-bold mt-1 px-4">{signUpErrors.fullName}</p>}
                                            </div>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#D4AF37] transition-colors" />
                                                <input type="email" name="email" value={signUpData.email} onChange={handleSignUpChange} placeholder="Email" className={`w-full pl-12 pr-4 py-4 border ${signUpErrors.email ? 'border-red-500' : 'border-gray-100 dark:border-gray-800'} rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-sm focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all`} />
                                                {signUpErrors.email && <p className="text-[10px] text-red-500 font-bold mt-1 px-4">{signUpErrors.email}</p>}
                                            </div>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-[#D4AF37] transition-colors" />
                                                <input type="tel" name="phone" value={signUpData.phone} onChange={handleSignUpChange} placeholder="Phone Number" className="w-full pl-12 pr-4 py-4 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-sm focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <input
                                                        type={showSignUpPassword ? "text" : "password"}
                                                        name="password"
                                                        value={signUpData.password}
                                                        onChange={handleSignUpChange}
                                                        placeholder="Password"
                                                        className={`w-full pl-5 pr-10 py-4 border ${signUpErrors.password ? 'border-red-500' : 'border-gray-100 dark:border-gray-800'} rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-sm focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
                                                    >
                                                        {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    {signUpErrors.password && <p className="text-[10px] text-red-500 font-bold mt-1 px-1">{signUpErrors.password}</p>}
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? "text" : "password"}
                                                        name="confirmPassword"
                                                        value={signUpData.confirmPassword}
                                                        onChange={handleSignUpChange}
                                                        placeholder="Confirm"
                                                        className={`w-full pl-5 pr-10 py-4 border ${signUpErrors.confirmPassword ? 'border-red-500' : 'border-gray-100 dark:border-gray-800'} rounded-2xl bg-gray-50 dark:bg-gray-800/50 text-sm focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all`}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                    {signUpErrors.confirmPassword && <p className="text-[10px] text-red-500 font-bold mt-1 px-1">{signUpErrors.confirmPassword}</p>}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 px-2 py-2">
                                                <input
                                                    type="checkbox"
                                                    name="agreeToTerms"
                                                    id="agreeToTerms"
                                                    checked={signUpData.agreeToTerms}
                                                    onChange={handleSignUpChange}
                                                    className="w-4 h-4 rounded border-gray-300 text-[#D4AF37] focus:ring-[#D4AF37]"
                                                />
                                                <label htmlFor="agreeToTerms" className={`text-[10px] font-bold uppercase tracking-widest ${signUpErrors.agreeToTerms ? 'text-red-500' : 'text-gray-400'}`}>
                                                    I agree to the Heritage Protocol
                                                </label>
                                            </div>
                                        </div>

                                        {signUpErrors.submit && (
                                            <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest bg-red-50 dark:bg-red-900/10 py-4 rounded-2xl border border-red-100 dark:border-red-900/20">
                                                {signUpErrors.submit}
                                            </p>
                                        )}

                                        <button type="submit" className="w-full py-5 bg-black dark:bg-[#D4AF37] text-white dark:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all mt-6 shadow-black/20">
                                            Create Heritage ID
                                        </button>
                                    </form>

                                    <p className="mt-12 text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                                        Already a resident? {' '}
                                        <button onClick={() => setIsSignUp(false)} className="text-[#D4AF37] ml-2 hover:underline">Log In</button>
                                    </p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* RIGHT PANEL (Login) */}
                    <div className={`w-full md:w-[40%] h-full ml-auto flex items-center justify-center p-8 lg:p-16 transition-all duration-1000 ease-in-out ${!isSignUp ? 'opacity-100 translate-x-0 z-20' : 'opacity-0 -translate-x-20 pointer-events-none z-10'
                        }`}>
                        <div className="w-full max-w-sm">
                            <div className="mb-12 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start mb-10 group cursor-default">
                                    <span className="text-5xl font-serif text-black dark:text-white tracking-tighter group-hover:tracking-normal transition-all duration-700">Mysuru</span>
                                    <span className="text-5xl font-bold text-[#D4AF37] ml-2">Marga</span>
                                </div>
                                <h1 className="text-4xl font-serif text-gray-900 dark:text-white mb-3">Welcome Back</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Access the heritage core</p>
                            </div>

                            <form onSubmit={handleLoginSubmit} className="space-y-6">
                                <div className="space-y-5">
                                    <div className="relative group">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
                                        <input
                                            type="text"
                                            value={loginIdentifier}
                                            onChange={(e) => setLoginIdentifier(e.target.value)}
                                            placeholder="Email Address"
                                            className="w-full pl-16 pr-6 py-6 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all shadow-inner"
                                            required
                                        />
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-[#D4AF37] transition-colors" />
                                        <input
                                            type={showLoginPassword ? 'text' : 'password'}
                                            value={loginPassword}
                                            onChange={(e) => setLoginPassword(e.target.value)}
                                            placeholder="Password"
                                            className="w-full pl-16 pr-16 py-6 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all shadow-inner"
                                            required
                                        />
                                        <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#D4AF37] transition-colors">
                                            {showLoginPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                                        </button>
                                    </div>
                                </div>

                                {loginError && <p className="text-red-500 text-[10px] font-black text-center uppercase tracking-widest bg-red-50 dark:bg-red-900/10 py-4 rounded-2xl border border-red-100 dark:border-red-900/20">{loginError}</p>}

                                <button
                                    type="submit"
                                    disabled={isLoggingIn}
                                    className="w-full py-6 bg-black dark:bg-[#D4AF37] text-white dark:text-black rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_25px_50px_-15px_rgba(212,175,55,0.4)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-500 mt-4 flex items-center justify-center"
                                >
                                    {isLoggingIn ? (
                                        <div className="w-5 h-5 border-2 border-white dark:border-black border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        'Enter The Gates'
                                    )}
                                </button>
                            </form>

                            <p className="mt-16 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                New to the City? {' '}
                                <button onClick={() => setIsSignUp(true)} className="text-[#D4AF37] ml-2 hover:underline">Register Now</button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
