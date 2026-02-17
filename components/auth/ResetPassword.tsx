import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface ResetPasswordProps {
    onComplete: () => void;
}

export const ResetPassword: React.FC<ResetPasswordProps> = ({ onComplete }) => {
    const { updatePassword } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        const { error: updateError } = await updatePassword(newPassword);

        if (updateError) {
            setError(updateError.message);
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
            // Redirect to app after 2 seconds
            setTimeout(() => {
                onComplete();
            }, 2000);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#101622] p-4">
            <div className="w-full max-w-md">
                {/* Logo/Title */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-[#135bec] to-[#4a90ff] bg-clip-text text-transparent mb-2">
                        Visionary PX Studio
                    </h1>
                    <p className="text-slate-400">Reset Your Password</p>
                </div>

                {/* Reset Password Card */}
                <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl shadow-[#135bec]/10">
                    {success ? (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-icons-round text-green-400 text-4xl">check_circle</span>
                            </div>
                            <h2 className="text-2xl font-semibold text-slate-100 mb-2">Password Updated!</h2>
                            <p className="text-slate-400 text-sm">Redirecting to your dashboard...</p>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold text-slate-100 mb-6">Set New Password</h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* New Password Input */}
                                <div>
                                    <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-2">
                                        New Password
                                    </label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all"
                                        placeholder="Enter new password (min 6 characters)"
                                    />
                                </div>

                                {/* Confirm Password Input */}
                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-2">
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#135bec] focus:border-transparent transition-all"
                                        placeholder="Confirm new password"
                                    />
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 bg-gradient-to-r from-[#135bec] to-[#4a90ff] text-white font-semibold rounded-lg shadow-lg shadow-[#135bec]/30 hover:shadow-[#135bec]/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Updating Password...' : 'Update Password'}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
