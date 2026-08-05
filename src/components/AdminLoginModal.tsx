import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Lock, User, Eye, EyeOff, LogOut, CheckCircle, 
  X, Search, Download, Plus, Trash2, DollarSign, CreditCard, 
  Package, Users, FileSpreadsheet, RefreshCw, KeyRound, AlertCircle,
  FileText, Car, Mail, MessageSquare, Tag, Settings, Key, Send, CheckCircle2,
  Printer, ArrowRight, Shield, Globe, Award
} from 'lucide-react';
import { CurrencyCode, formatConvertedPrice, FALLBACK_RATES_FROM_USD } from '../utils/currencyConverter';
import {
  loginAdminApi,
  verifyAdminSessionApi,
  getStoredAdminUser,
  getStoredAdminToken,
  clearAdminSession,
  changeAdminPasswordApi,
  requestForgotPasswordApi,
  resetPasswordWithTokenApi,
  fetchDashboardStatsApi,
  fetchBookingsApi,
  updateBookingStatusApi,
  deleteBookingApi,
  fetchCabBookingsApi,
  fetchCustomersApi,
  fetchPaymentLogsApi,
  fetchAuditLogsApi,
  fetchWebsiteSettingsApi,
  saveWebsiteSettingsApi,
  AdminUser,
} from '../services/adminAuthService';
import { downloadBookingPDF, downloadInvoicePDF } from '../utils/pdfGenerator';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (status: boolean) => void;
  bookings: any[];
  setBookings: React.Dispatch<React.SetStateAction<any[]>>;
  tourPackages: any[];
  setTourPackages: React.Dispatch<React.SetStateAction<any[]>>;
  currency?: CurrencyCode;
  rates?: Record<CurrencyCode, number>;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  bookings,
  setBookings,
  tourPackages,
  setTourPackages,
  currency = 'USD',
  rates = FALLBACK_RATES_FROM_USD,
}) => {
  const activeCurrency: CurrencyCode = (currency as CurrencyCode) || 'USD';

  // Auth States
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(getStoredAdminUser());
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Forgot / Reset Password States
  const [authViewMode, setAuthViewMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatusMsg, setForgotStatusMsg] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const [newResetPassword, setNewResetPassword] = useState('');

  // Password Change Modal/Tab
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [passChangeMsg, setPassChangeMsg] = useState('');
  const [passChangeError, setPassChangeError] = useState('');

  // Admin Dashboard Active Section (11 Required Sections)
  const [activeSection, setActiveSection] = useState<
    | 'dashboard'
    | 'bookings'
    | 'cabs'
    | 'customers'
    | 'payments'
    | 'vouchers'
    | 'logs'
    | 'tours'
    | 'vehicles'
    | 'offers'
    | 'settings'
    | 'changePassword'
  >('dashboard');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Data states fetched from API
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [cabBookingsList, setCabBookingsList] = useState<any[]>([
    {
      id: 1,
      cabBookingId: 'CAB-9012',
      guestName: 'David Miller',
      guestPhone: '+44 7700 900077',
      pickupCity: 'Delhi IGI Airport',
      dropCity: 'Agra City',
      pickupDate: '2026-08-12',
      pickupTime: '08:00 AM',
      vehicleName: 'Toyota Innova Crysta',
      estimatedFareINR: 4320,
      driverAssigned: 'Ramesh Singh (+91 98765 12345)',
      status: 'ASSIGNED',
    },
  ]);
  const [customersList, setCustomersList] = useState<any[]>([
    { id: 1, customer_uuid: 'CUST-881920', full_name: 'Sarah Thompson', email: 'sarah.t@example.com', phone: '+1 555-0199', total_bookings: 1 },
    { id: 2, customer_uuid: 'CUST-331209', full_name: 'Rajesh Kumar', email: 'rajesh.k@gmail.com', phone: '+91 98112 34567', total_bookings: 1 },
  ]);
  const [paymentLogs, setPaymentLogs] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([
    { id: 1, log_type: 'EMAIL', recipient: 'sarah.t@example.com', subject_or_template: 'PDF Voucher Confirmation ZT-892410', status: 'DELIVERED', created_at: new Date().toLocaleDateString('en-GB') },
    { id: 2, log_type: 'WHATSAPP', recipient: '+919933992786', subject_or_template: 'Twilio Dispatch ZT-892410', status: 'SENT', created_at: new Date().toLocaleDateString('en-GB') },
  ]);
  const [websiteSettings, setWebsiteSettings] = useState<any>({
    companyName: 'Zaara Travels',
    gstin: '19ACUPH2897Q2ZA',
    primaryPhone: '+91 99339 92786',
    secondaryPhone: '+91 99329 99786',
    officePhone: '+011 69296175',
    whatsappNumber: '+919933992786',
    primaryEmail: 'info@zaaratravel.com',
    address: 'Rani Garden, Shastri Nagar, Geeta Colony, New Delhi, Delhi 110031',
    maintenanceMode: false,
  });

  // New Tour Form State
  const [newTourTitle, setNewTourTitle] = useState('');
  const [newTourCategory, setNewTourCategory] = useState('golden-triangle');
  const [newTourDuration, setNewTourDuration] = useState('3 Days / 2 Nights');
  const [newTourPriceUSD, setNewTourPriceUSD] = useState<number | ''>(250);
  const [newTourPriceINR, setNewTourPriceINR] = useState<number | ''>(21000);
  const [newTourImage, setNewTourImage] = useState('https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80');
  const [newTourHighlights, setNewTourHighlights] = useState('Private AC Sedan, Dedicated Tour Guide, Entrance Tickets');
  const [tourSuccessMsg, setTourSuccessMsg] = useState('');

  // Offers State
  const [promoCodes, setPromoCodes] = useState([
    { code: 'ZAARA2026', discount: '10% OFF', validUntil: 'Dec 31, 2026', status: 'ACTIVE' },
    { code: 'TAJVIP', discount: '15% OFF', validUntil: 'Nov 30, 2026', status: 'ACTIVE' },
  ]);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('10%');

  // Verify JWT session on modal mount
  useEffect(() => {
    const token = getStoredAdminToken();
    if (token) {
      verifyAdminSessionApi().then((res) => {
        if (res.ok && res.data.success) {
          setIsAdminLoggedIn(true);
          setCurrentAdmin(res.data.admin);
        } else {
          setIsAdminLoggedIn(false);
          clearAdminSession();
        }
      });
    }
  }, [setIsAdminLoggedIn]);

  // Load dashboard data when logged in
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchDashboardStatsApi().then((res) => {
        if (res.ok && res.data.success) setDashboardStats(res.data.stats);
      });
      fetchCabBookingsApi().then((res) => {
        if (res.ok && res.data.success) setCabBookingsList(res.data.cabBookings);
      });
      fetchCustomersApi().then((res) => {
        if (res.ok && res.data.success) setCustomersList(res.data.customers);
      });
      fetchPaymentLogsApi().then((res) => {
        if (res.ok && res.data.success) setPaymentLogs(res.data.payments);
      });
      fetchAuditLogsApi().then((res) => {
        if (res.ok && res.data.success) setAuditLogs(res.data.logs);
      });
      fetchWebsiteSettingsApi().then((res) => {
        if (res.ok && res.data.success) setWebsiteSettings(res.data.settings);
      });
    }
  }, [isAdminLoggedIn]);

  if (!isOpen) return null;

  // Handle DB-Based Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccessMsg('');
    setIsAuthenticating(true);

    try {
      const { ok, data } = await loginAdminApi(username, password, rememberMe);

      if (ok && data.success) {
        setIsAdminLoggedIn(true);
        setCurrentAdmin(data.admin);
        setLoginSuccessMsg('Authentication Verified! Loading Admin Console...');
      } else {
        setLoginError(data.message || 'Invalid Administrator Username or Password.');
      }
    } catch (err: any) {
      setLoginError('Server authentication error. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQuickDemoFill = () => {
    setUsername('admin');
    setPassword('zaara2026');
    setLoginError('');
  };

  const handleLogout = () => {
    clearAdminSession();
    setIsAdminLoggedIn(false);
    setCurrentAdmin(null);
    setActiveSection('dashboard');
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeMsg('');
    setPassChangeError('');

    if (newPassInput.length < 6) {
      setPassChangeError('New password must be at least 6 characters.');
      return;
    }

    const { ok, data } = await changeAdminPasswordApi(currentPassInput, newPassInput);
    if (ok && data.success) {
      setPassChangeMsg('Password updated successfully in MySQL database!');
      setCurrentPassInput('');
      setNewPassInput('');
    } else {
      setPassChangeError(data.message || 'Failed to change password.');
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatusMsg('Processing request...');
    const res = await requestForgotPasswordApi(forgotEmail);
    setForgotStatusMsg(res.message || 'Password reset request dispatched.');
  };

  // Handle Reset Password with Token
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatusMsg('Verifying reset token...');
    const res = await resetPasswordWithTokenApi(resetTokenInput, newResetPassword);
    setForgotStatusMsg(res.message);
    if (res.success) {
      setTimeout(() => setAuthViewMode('login'), 2000);
    }
  };

  // Update payment status for a booking
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.bookingId === bookingId ? { ...b, paymentStatus: newStatus } : b))
    );
    await updateBookingStatusApi(bookingId, newStatus);
  };

  // Delete booking
  const handleDeleteBooking = async (bookingId: string) => {
    if (window.confirm(`Are you sure you want to delete booking ${bookingId}?`)) {
      setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
      await deleteBookingApi(bookingId);
    }
  };

  // Add Custom Tour Package
  const handleAddTourSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourTitle.trim()) return;

    const priceUSD = typeof newTourPriceUSD === 'number' ? newTourPriceUSD : 200;
    const priceINR = typeof newTourPriceINR === 'number' ? newTourPriceINR : 16500;

    const customTour = {
      id: `custom-tour-${Date.now()}`,
      title: newTourTitle.trim(),
      category: newTourCategory,
      duration: newTourDuration,
      priceUSD,
      priceINR,
      image: newTourImage || 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
      highlights: newTourHighlights.split(',').map((h) => h.trim()).filter(Boolean),
      description: 'Exclusive custom package curated directly by Zaara Travels management.',
      rating: 5.0,
      reviewsCount: 1,
      tag: 'Admin Special',
    };

    try {
      const existingCustom = JSON.parse(localStorage.getItem('zaara_custom_tours') || '[]');
      const updated = [customTour, ...existingCustom];
      localStorage.setItem('zaara_custom_tours', JSON.stringify(updated));
      window.dispatchEvent(new Event('zaara_tours_updated'));
      setTourPackages((prev) => [customTour, ...prev]);

      setTourSuccessMsg(`Package "${newTourTitle}" published successfully to live catalog!`);
      setNewTourTitle('');
      setTimeout(() => setTourSuccessMsg(''), 4000);
    } catch (err) {
      console.error('Failed to save tour package', err);
    }
  };

  // Export Bookings CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('No booking records available to export.');
      return;
    }

    const headers = ['Booking ID', 'Guest Name', 'Email', 'Phone', 'Tour Title', 'Travel Date', 'Vehicle', 'Base Amount (INR)', 'GST 5% (INR)', 'Total INR', 'Total USD', 'Payment Status', 'Payment Method'];
    const rows = bookings.map((b) => {
      const baseINR = b.baseAmountINR ?? Math.round((b.totalAmountINR || 0) / 1.05);
      const gstINR = b.gstAmountINR ?? ((b.totalAmountINR || 0) - baseINR);
      return [
        b.bookingId,
        `"${b.guestName || ''}"`,
        `"${b.guestEmail || ''}"`,
        `"${b.guestPhone || ''}"`,
        `"${b.tourTitle || ''}"`,
        b.travelDate || '',
        `"${b.vehicleType || ''}"`,
        baseINR,
        gstINR,
        b.totalAmountINR,
        b.totalAmountUSD,
        `"${b.paymentStatus || ''}"`,
        `"${b.paymentMethod || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Zaara_Travels_Bookings_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      (b.bookingId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.guestName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.guestEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.tourTitle || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalRevenueINR = bookings.reduce((sum, b) => sum + (b.totalAmountINR || 0), 0);
  const totalRevenueUSD = bookings.reduce((sum, b) => sum + (b.totalAmountUSD || 0), 0);
  const totalGSTINR = bookings.reduce((sum, b) => {
    const base = b.baseAmountINR ?? Math.round((b.totalAmountINR || 0) / 1.05);
    return sum + ((b.totalAmountINR || 0) - base);
  }, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl w-full max-w-6xl text-slate-100 overflow-hidden flex flex-col max-h-[94vh]">
        
        {/* Modal Top Navigation Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-3.5 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white tracking-wide">
                  Zaara Travels Admin Portal
                </h3>
                {isAdminLoggedIn ? (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-black px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    JWT Auth Active ({currentAdmin?.role || 'Admin'})
                  </span>
                ) : (
                  <span className="bg-amber-500/10 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/20">
                    Database Authenticated
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {isAdminLoggedIn
                  ? `Signed in as ${currentAdmin?.full_name || currentAdmin?.username} (${currentAdmin?.email})`
                  : 'MySQL Database & Bcrypt Password Protection'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/50 hover:bg-red-900/50 border border-red-800/80 px-3 py-1.5 rounded-lg transition"
                title="Log out and clear JWT token"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 overflow-y-auto grow space-y-5">
          {!isAdminLoggedIn ? (
            /* DATABASE LOGIN & FORGOT PASSWORD SCREEN */
            <div className="max-w-md mx-auto py-4 sm:py-8 space-y-6">
              
              {authViewMode === 'login' && (
                <>
                  <div className="text-center space-y-2">
                    <div className="inline-flex p-3 bg-slate-800 border border-slate-700 rounded-2xl text-amber-400 mb-1">
                      <Lock className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-black text-white">Administrator Login</h4>
                    <p className="text-xs text-slate-400">
                      MySQL Database Authenticated • Bcrypt Password Hashing • JWT Token Protection
                    </p>
                  </div>

                  {loginError && (
                    <div className="bg-red-950/80 border border-red-800/80 p-3.5 rounded-xl text-xs text-red-300 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {loginSuccessMsg && (
                    <div className="bg-emerald-950/80 border border-emerald-800 p-3.5 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{loginSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                        Username / Admin Email
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="admin or admin@zaaratravels.com"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => setAuthViewMode('forgot')}
                          className="text-[11px] text-amber-400 hover:underline font-bold"
                        >
                          Forgot Password?
                        </button>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm font-medium text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="rounded border-slate-700 bg-slate-950 text-amber-500 focus:ring-amber-500"
                        />
                        <span>Remember session on this device</span>
                      </label>
                    </div>

                    <div className="pt-2 space-y-3">
                      <button
                        type="submit"
                        disabled={isAuthenticating}
                        className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
                      >
                        {isAuthenticating ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                            <span>Verifying Credentials in Database...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            <span>Sign In to Admin Dashboard</span>
                          </>
                        )}
                      </button>

                      <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-2">
                        <p className="text-[11px] text-slate-400">
                          Database Admin Credentials: <code className="text-amber-400 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">admin</code> / <code className="text-amber-400 font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">zaara2026</code>
                        </p>
                        <button
                          type="button"
                          onClick={handleQuickDemoFill}
                          className="text-xs text-sky-400 hover:text-sky-300 font-bold underline underline-offset-2 transition"
                        >
                          Auto-Fill Demo Credentials
                        </button>
                      </div>
                    </div>
                  </form>
                </>
              )}

              {/* FORGOT PASSWORD VIEW */}
              {authViewMode === 'forgot' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-lg font-black text-white">Reset Admin Password</h4>
                    <p className="text-xs text-slate-400">
                      Enter your admin email to receive password reset token.
                    </p>
                  </div>

                  {forgotStatusMsg && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-amber-300">
                      {forgotStatusMsg}
                    </div>
                  )}

                  <form onSubmit={handleForgotSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Admin Email</label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="admin@zaaratravels.com"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      Send Reset Instructions
                    </button>
                  </form>

                  <div className="flex justify-between text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthViewMode('reset')}
                      className="text-sky-400 hover:underline font-bold"
                    >
                      Already have a Reset Token?
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthViewMode('login')}
                      className="text-slate-400 hover:text-white"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </div>
              )}

              {/* RESET PASSWORD WITH TOKEN VIEW */}
              {authViewMode === 'reset' && (
                <div className="space-y-4">
                  <div className="text-center space-y-1">
                    <h4 className="text-lg font-black text-white">Enter Reset Token & New Password</h4>
                  </div>

                  {forgotStatusMsg && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-amber-300">
                      {forgotStatusMsg}
                    </div>
                  )}

                  <form onSubmit={handleResetSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Reset Token</label>
                      <input
                        type="text"
                        required
                        value={resetTokenInput}
                        onChange={(e) => setResetTokenInput(e.target.value)}
                        placeholder="Paste reset token here..."
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      Update Password
                    </button>
                  </form>

                  <div className="text-center text-xs pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthViewMode('login')}
                      className="text-slate-400 hover:text-white"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            /* LOGGED IN ADMIN DASHBOARD WITH ALL 11 SECTIONS */
            <div className="space-y-5">
              
              {/* Navigation Bar across 11 Sections */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: Shield },
                  { id: 'bookings', label: `Tour Bookings (${bookings.length})`, icon: FileSpreadsheet },
                  { id: 'cabs', label: `Cab Rentals (${cabBookingsList.length})`, icon: Car },
                  { id: 'customers', label: `Customers (${customersList.length})`, icon: Users },
                  { id: 'payments', label: 'Payments', icon: CreditCard },
                  { id: 'vouchers', label: 'PDF Vouchers', icon: FileText },
                  { id: 'logs', label: 'Email/WA Logs', icon: Mail },
                  { id: 'tours', label: 'Manage Tours', icon: Package },
                  { id: 'vehicles', label: 'Vehicle Fleet', icon: Car },
                  { id: 'offers', label: 'Offers & Codes', icon: Tag },
                  { id: 'settings', label: 'Settings', icon: Settings },
                  { id: 'changePassword', label: 'Security', icon: Key },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                        activeSection === item.id
                          ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                          : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* SECTION 1: DASHBOARD OVERVIEW */}
              {activeSection === 'dashboard' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Bookings</span>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-sky-400 shrink-0" />
                        <span className="text-2xl font-black text-white">{bookings.length}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Turnover</span>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span className="text-xl font-black text-emerald-400">
                          {formatConvertedPrice(totalRevenueUSD, totalRevenueINR, activeCurrency, rates)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">GST Collected (5%)</span>
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-5 h-5 text-amber-400 shrink-0" />
                        <span className="text-xl font-black text-amber-300">
                          ₹{totalGSTINR.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cab Requests</span>
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-purple-400 shrink-0" />
                        <span className="text-2xl font-black text-white">{cabBookingsList.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                    <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      System & Database Status
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Database Engine</span>
                        <span className="font-bold text-emerald-400">MySQL Database Active</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Password Hash</span>
                        <span className="font-bold text-sky-400">Bcrypt Salt 10 Rounds</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Authentication</span>
                        <span className="font-bold text-amber-400">JWT Token Middleware</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 2: TOUR BOOKINGS MANAGEMENT */}
              {activeSection === 'bookings' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-3 justify-between">
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by ID, Guest Name, Email, or Tour..."
                        className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportCSV}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase font-black text-[10px]">
                          <th className="py-3 px-3">Booking ID</th>
                          <th className="py-3 px-3">Guest Info</th>
                          <th className="py-3 px-3">Tour Details</th>
                          <th className="py-3 px-3">Date</th>
                          <th className="py-3 px-3">Amount</th>
                          <th className="py-3 px-3">Status</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {filteredBookings.map((b) => (
                          <tr key={b.bookingId} className="hover:bg-slate-900/50 transition">
                            <td className="py-3 px-3 font-mono font-bold text-amber-400">{b.bookingId}</td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-white">{b.guestName}</div>
                              <div className="text-[10px] text-slate-400">{b.guestEmail} • {b.guestPhone}</div>
                            </td>
                            <td className="py-3 px-3 max-w-xs truncate">{b.tourTitle}</td>
                            <td className="py-3 px-3 whitespace-nowrap">{b.travelDate}</td>
                            <td className="py-3 px-3 font-black text-emerald-400">
                              {formatConvertedPrice(b.totalAmountUSD, b.totalAmountINR, activeCurrency, rates)}
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={b.paymentStatus || 'PAID IN FULL'}
                                onChange={(e) => handleUpdateStatus(b.bookingId, e.target.value)}
                                className="bg-slate-900 text-[10px] font-bold border border-slate-700 rounded px-1.5 py-0.5 text-emerald-400"
                              >
                                <option value="PAID IN FULL">PAID IN FULL</option>
                                <option value="CONFIRMED">CONFIRMED</option>
                                <option value="PENDING">PENDING</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>
                            <td className="py-3 px-3 text-right space-x-1">
                              <button
                                onClick={() => downloadBookingPDF(b)}
                                className="p-1.5 text-sky-400 hover:bg-slate-800 rounded"
                                title="Download Voucher PDF"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => downloadInvoicePDF(b)}
                                className="p-1.5 text-amber-400 hover:bg-slate-800 rounded"
                                title="Download GST Tax Invoice PDF"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteBooking(b.bookingId)}
                                className="p-1.5 text-red-400 hover:bg-slate-800 rounded"
                                title="Delete Booking"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 3: CAB RENTAL BOOKINGS */}
              {activeSection === 'cabs' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-white">Cab Rental Booking Requests</h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <th className="py-3 px-3">Cab Ref</th>
                          <th className="py-3 px-3">Guest Name</th>
                          <th className="py-3 px-3">Route</th>
                          <th className="py-3 px-3">Vehicle</th>
                          <th className="py-3 px-3">Fare (INR)</th>
                          <th className="py-3 px-3">Driver Assigned</th>
                          <th className="py-3 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {cabBookingsList.map((c) => (
                          <tr key={c.id}>
                            <td className="py-3 px-3 font-mono font-bold text-amber-400">{c.cabBookingId}</td>
                            <td className="py-3 px-3">{c.guestName} ({c.guestPhone})</td>
                            <td className="py-3 px-3">{c.pickupCity} → {c.dropCity}</td>
                            <td className="py-3 px-3">{c.vehicleName}</td>
                            <td className="py-3 px-3 font-bold text-emerald-400">₹{c.estimatedFareINR}</td>
                            <td className="py-3 px-3 text-sky-300">{c.driverAssigned}</td>
                            <td className="py-3 px-3"><span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">{c.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 4: CUSTOMERS DIRECTORY */}
              {activeSection === 'customers' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-white">Customer Database Records</h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <th className="py-3 px-3">Customer UUID</th>
                          <th className="py-3 px-3">Full Name</th>
                          <th className="py-3 px-3">Email</th>
                          <th className="py-3 px-3">Phone</th>
                          <th className="py-3 px-3">Total Bookings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {customersList.map((cust) => (
                          <tr key={cust.id}>
                            <td className="py-3 px-3 font-mono text-amber-400">{cust.customer_uuid}</td>
                            <td className="py-3 px-3 font-bold">{cust.full_name}</td>
                            <td className="py-3 px-3">{cust.email}</td>
                            <td className="py-3 px-3">{cust.phone}</td>
                            <td className="py-3 px-3 font-black text-sky-400">{cust.total_bookings}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 5: PAYMENT TRANSACTIONS */}
              {activeSection === 'payments' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-white">Payment Gateway Logs (Razorpay / PayU / PayPal)</h4>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
                    All online payments are verified server-side with HMAC-SHA256 signatures before confirming vouchers.
                  </div>
                </div>
              )}

              {/* SECTION 6: VOUCHER MANAGEMENT */}
              {activeSection === 'vouchers' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-white">Invoice & Booking Voucher Generator</h4>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <p className="text-xs text-slate-300">Generate, view, and print official Zaara Travels PDF Vouchers with GSTIN 19ACUPH2897Q2ZA.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          if (bookings.length > 0) downloadInvoicePDF(bookings[0]);
                        }}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Preview Sample Voucher</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 7: EMAIL & WHATSAPP LOGS */}
              {activeSection === 'logs' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-white">Email & WhatsApp Notification Dispatch Logs</h4>
                  <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                          <th className="py-3 px-3">Type</th>
                          <th className="py-3 px-3">Recipient</th>
                          <th className="py-3 px-3">Subject / Template</th>
                          <th className="py-3 px-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-200">
                        {auditLogs.map((log) => (
                          <tr key={log.id}>
                            <td className="py-3 px-3 font-bold text-amber-400">{log.log_type}</td>
                            <td className="py-3 px-3">{log.recipient}</td>
                            <td className="py-3 px-3">{log.subject_or_template}</td>
                            <td className="py-3 px-3"><span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">{log.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 8: PUBLISH CUSTOM TOUR */}
              {activeSection === 'tours' && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 max-w-2xl mx-auto">
                  <h4 className="font-extrabold text-base text-white">Publish New Tour Package</h4>
                  {tourSuccessMsg && (
                    <div className="bg-emerald-950 border border-emerald-800 p-3 rounded-xl text-xs text-emerald-300">
                      {tourSuccessMsg}
                    </div>
                  )}

                  <form onSubmit={handleAddTourSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Package Title</label>
                      <input
                        type="text"
                        required
                        value={newTourTitle}
                        onChange={(e) => setNewTourTitle(e.target.value)}
                        placeholder="e.g. 4-Day Golden Triangle Luxury Safari Express"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Price (USD $)</label>
                        <input
                          type="number"
                          required
                          value={newTourPriceUSD}
                          onChange={(e) => setNewTourPriceUSD(Number(e.target.value) || '')}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1">Price (INR ₹)</label>
                        <input
                          type="number"
                          required
                          value={newTourPriceINR}
                          onChange={(e) => setNewTourPriceINR(Number(e.target.value) || '')}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      Publish Package
                    </button>
                  </form>
                </div>
              )}

              {/* SECTION 9: VEHICLE FLEET MANAGEMENT */}
              {activeSection === 'vehicles' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-white">Vehicle Fleet Management</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Toyota Innova Crysta', 'Maruti Dzire AC', 'Tempo Traveller 12 Seater'].map((v, i) => (
                      <div key={i} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
                        <span className="font-bold text-amber-400 block">{v}</span>
                        <span className="text-xs text-slate-400 block">Rate: ₹16 - ₹22 / KM</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Status: Available</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 10: OFFERS & DISCOUNTS */}
              {activeSection === 'offers' && (
                <div className="space-y-4">
                  <h4 className="font-extrabold text-sm text-white">Manage Promo Codes & Special Offers</h4>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo Code (e.g. ZAARA10)"
                        value={newPromoCode}
                        onChange={(e) => setNewPromoCode(e.target.value)}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white uppercase"
                      />
                      <button
                        onClick={() => {
                          if (newPromoCode) {
                            setPromoCodes([...promoCodes, { code: newPromoCode.toUpperCase(), discount: '10% OFF', validUntil: 'Dec 2026', status: 'ACTIVE' }]);
                            setNewPromoCode('');
                          }
                        }}
                        className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-xl text-xs"
                      >
                        Add Code
                      </button>
                    </div>

                    <div className="space-y-2">
                      {promoCodes.map((p, i) => (
                        <div key={i} className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs">
                          <span className="font-mono font-bold text-amber-400">{p.code}</span>
                          <span className="text-emerald-400 font-bold">{p.discount}</span>
                          <span className="text-slate-400 text-[10px]">{p.validUntil}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 11: WEBSITE SETTINGS */}
              {activeSection === 'settings' && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 max-w-2xl mx-auto">
                  <h4 className="font-extrabold text-base text-white">Company Information & Settings</h4>
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">GSTIN Number</label>
                      <input
                        type="text"
                        value={websiteSettings.gstin}
                        onChange={(e) => setWebsiteSettings({ ...websiteSettings, gstin: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Primary WhatsApp Helpline</label>
                      <input
                        type="text"
                        value={websiteSettings.primaryPhone}
                        onChange={(e) => setWebsiteSettings({ ...websiteSettings, primaryPhone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => saveWebsiteSettingsApi(websiteSettings)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              )}

              {/* CHANGE PASSWORD TAB */}
              {activeSection === 'changePassword' && (
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 max-w-md mx-auto">
                  <h4 className="font-extrabold text-base text-white">Change Administrator Password</h4>
                  {passChangeMsg && (
                    <div className="bg-emerald-950 border border-emerald-800 p-3 rounded-xl text-xs text-emerald-300">
                      {passChangeMsg}
                    </div>
                  )}
                  {passChangeError && (
                    <div className="bg-red-950 border border-red-800 p-3 rounded-xl text-xs text-red-300">
                      {passChangeError}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassInput}
                        onChange={(e) => setCurrentPassInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassInput}
                        onChange={(e) => setNewPassInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs"
                    >
                      Update Password (Bcrypt Encrypted)
                    </button>
                  </form>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
