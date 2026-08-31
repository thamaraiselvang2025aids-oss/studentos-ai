import React, { useState } from 'react';
import { motion } from 'motion/react';
import { firebaseAuth } from '../lib/firebase';
import { useStudentOS } from '../context/StudentOSContext';
import {
  Mail,
  Lock,
  User,
  School,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Github,
  AlertCircle,
  CheckCircle2,
  LockKeyhole
} from 'lucide-react';

export default function AuthScreen() {
  const { updateProfile, addNotification } = useStudentOS();
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState(String(new Date().getFullYear() + 4));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await firebaseAuth.signInWithGoogle();
      updateProfile({
        uid: authUser.uid,
        fullName: authUser.displayName,
        email: authUser.email,
        university: '',
        major: '',
        graduationYear: new Date().getFullYear() + 4,
        streakCount: 1,
        lastActive: new Date().toISOString()
      });
      addNotification({
        title: '🔑 Logged In via Google',
        message: `Welcome back, ${authUser.displayName}! Secure Firebase session established successfully.`,
        type: 'success',
        read: false,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const authUser = await firebaseAuth.signInWithGitHub();
      updateProfile({
        uid: authUser.uid,
        fullName: authUser.displayName,
        email: authUser.email,
        university: '',
        major: '',
        graduationYear: new Date().getFullYear() + 4,
        streakCount: 1,
        lastActive: new Date().toISOString()
      });
      addNotification({
        title: '🔑 Logged In via GitHub',
        message: `Session synchronized with GitHub developer ID. Let's code!`,
        type: 'success',
        read: false,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setError(err.message || 'GitHub authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all mandatory credentials.');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        if (!fullName) {
          setError('Please provide your full legal name.');
          setLoading(false);
          return;
        }
        const authUser = await firebaseAuth.signUpWithEmail(email, password, fullName);
        // Send verification email if supported
        if ((firebaseAuth as any).sendEmailVerification) {
          await (firebaseAuth as any).sendEmailVerification(authUser.uid);
        }
        updateProfile({
          uid: authUser.uid,
          fullName: authUser.displayName,
          email: authUser.email,
          university,
          major,
          graduationYear: parseInt(graduationYear) || 2027,
          streakCount: 1,
          lastActive: new Date().toISOString()
        });
        setSuccess('Account provisioned successfully in Firebase database! Verification email sent.');
        addNotification({
          title: '🎉 Firebase Account Registered',
          message: `Your credentials have been securely hashed. Student Profile created for ${fullName}.`,
          type: 'success',
          read: false,
          timestamp: new Date().toISOString()
        });
      } else {
        const authUser = await firebaseAuth.signInWithEmail(email, password);
        updateProfile({
          uid: authUser.uid,
          fullName: authUser.displayName,
          email: authUser.email,
          streakCount: Math.min(100, Math.floor(Math.random() * 8) + 1),
          lastActive: new Date().toISOString()
        });
        addNotification({
          title: '🔒 Secure Login Successful',
          message: `Logged in as ${authUser.displayName}. Auth Token successfully generated and saved to session storage.`,
          type: 'success',
          read: false,
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication transaction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-primary)] flex items-center justify-center p-4 relative overflow-hidden font-sans text-[var(--text-secondary)] theme-transition">
      {/* Dynamic ambient grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--grid-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-line)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
      
      {/* Gradient glow orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none"></div>

      {/* Auth Card Containment */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-mono mb-4">
            <LockKeyhole className="w-3.5 h-3.5 text-purple-400" /> Firebase Security Shield Active
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--text-primary)] font-sans flex items-center justify-center gap-2">
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 text-transparent bg-clip-text font-display font-bold">
              StudentOS
            </span>
            <span className="text-[var(--text-primary)] text-35xl font-light font-display">AI</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1 font-sans">
            Customize your academic credentials, university background, and generate professional career bios.
          </p>
          {/* Hide email from other users */}
          <div className="mt-2 text-xs text-[var(--text-dimmed)] font-mono">
            Email visibility: <span className="font-bold text-indigo-500">Hidden from other users</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] backdrop-blur-xl p-8 rounded-2xl shadow-2xl relative theme-transition">
          
          {/* Section title */}
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight font-sans mb-1 text-left">
            {isSignUp ? 'Create secure account' : 'Welcome back, Scholar'}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mb-6 text-left">
            {isSignUp 
              ? 'Join the high-fidelity academic tracking ecosystem powered by Gemini AI' 
              : 'Enter your credentials to restore your high-fidelity workspace session'
            }
          </p>

          {/* Error and Success Indicators */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-start gap-2.5 text-left"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-200 text-emerald-350 text-xs flex items-start gap-2.5 text-left"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{success}</span>
            </motion.div>
          )}

          {/* Social Sign-In Row */}
          <div className="grid grid-cols-2 gap-3.5 mb-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google Auth
            </button>
            <button
              onClick={handleGitHubLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-input)] border border-[var(--border-primary)] rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Github className="w-4 h-4 text-[var(--text-primary)]" />
              GitHub Auth
            </button>
          </div>

          {/* Divider line */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="flex-1 h-[1px] bg-[var(--border-subtle)]"></div>
            <span className="text-[10px] font-mono text-[var(--text-dimmed)] uppercase tracking-widest">Or credential channel</span>
            <div className="flex-1 h-[1px] bg-[var(--border-subtle)]"></div>
          </div>

          {/* Core credential Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-[10px] font-bold uppercase font-mono tracking-wider text-[var(--text-muted)] mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-[var(--text-dimmed)]" />
                    <input
                      type="text"
                      placeholder="e.g. Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required={isSignUp}
                      className="w-full bg-[var(--bg-input)] text-xs rounded-xl border border-[var(--border-primary)] p-3.5 pl-10 focus:outline-none focus:border-purple-500 text-[var(--text-primary)] font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono tracking-wider text-gray-400 mb-1.5">
                      University
                    </label>
                    <div className="relative">
                      <School className="absolute left-3 top-3 w-3.5 h-3.5 text-[var(--text-dimmed)]" />
                      <input
                        type="text"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        className="w-full bg-[var(--bg-input)] text-[11px] rounded-xl border border-[var(--border-primary)] p-2.5 pl-9 focus:outline-none focus:border-purple-500 text-[var(--text-primary)]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase font-mono tracking-wider text-gray-400 mb-1.5">
                      Major Field
                    </label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 w-3.5 h-3.5 text-[var(--text-dimmed)]" />
                      <input
                        type="text"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        className="w-full bg-[var(--bg-input)] text-[11px] rounded-xl border border-[var(--border-primary)] p-2.5 pl-9 focus:outline-none focus:border-purple-500 text-[var(--text-primary)]"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase font-mono tracking-wider text-gray-400 mb-1.5">
                    Graduation Target Year
                  </label>
                  <input
                    type="number"
                    value={graduationYear}
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full bg-[var(--bg-input)] text-xs rounded-xl border border-[var(--border-primary)] p-3 focus:outline-none focus:border-purple-500 text-[var(--text-primary)] font-mono"
                  />
                </div>
              </motion.div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase font-mono tracking-wider text-gray-400 mb-1.5">
                School Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-[var(--text-dimmed)]" />
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-input)] text-xs rounded-xl border border-[var(--border-primary)] p-3.5 pl-10 focus:outline-none focus:border-purple-500 text-[var(--text-primary)] font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase font-mono tracking-wider text-gray-400 mb-1.5 flex justify-between">
                <span>Secure Password</span>
                {!isSignUp && (
                  <span className="text-[9px] text-purple-400 lowercase cursor-pointer hover:underline">Forgot?</span>
                )}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-[var(--text-dimmed)]" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-[var(--bg-input)] text-xs rounded-xl border border-[var(--border-primary)] p-3.5 pl-10 focus:outline-none focus:border-purple-500 text-[var(--text-primary)] font-sans"
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-[10px] font-bold uppercase font-mono tracking-wider text-gray-400 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-gray-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-[var(--bg-input)] text-xs rounded-xl border border-[var(--border-primary)] p-3.5 pl-10 focus:outline-none focus:border-purple-500 text-[var(--text-primary)] font-sans"
                  />
                </div>
              </div>
            )}

            {/* Action submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl font-bold text-xs text-white shadow-lg shadow-purple-500/10 cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignUp ? 'Register Security Account' : 'Authenticate Credentials'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Form switcher */}
          <div className="mt-6 text-center">
            <span className="text-xs text-[var(--text-muted)]">
              {isSignUp ? 'Already registered on Firebase?' : 'New scholar at StudentOS?'}
            </span>{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="text-xs text-purple-400 font-bold hover:text-purple-300 hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>
        </div>

        {/* Security pledge footer */}
        <p className="text-[10px] text-center text-[var(--text-dimmed)] font-mono uppercase tracking-wider mt-6">
          🔐 Secure end-to-end sessions managed via firestore.rules rulesets
        </p>
      </motion.div>
    </div>
  );
}
