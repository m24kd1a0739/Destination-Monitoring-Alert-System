import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { User, Phone, X, Save, LogOut, Shield } from 'lucide-react';

interface EditProfileModalProps {
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose }) => {
  const { user, updateProfile, logout } = useAuth();
  const { t } = useSettings();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && phone.trim()) {
      updateProfile(name, phone);
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/85 backdrop-blur-md">
      <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">{t.editProfile}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-dark-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.fullName}
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {t.phoneNumber}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-dark-card border border-dark-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-dark-card hover:bg-dark-hover text-slate-300 font-medium text-sm border border-dark-border transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{t.save}</span>
            </button>
          </div>
        </form>

        {/* Divider */}
        <hr className="my-5 border-dark-border" />

        {/* Logout Section */}
        {showLogoutConfirm ? (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/25 text-center">
            <p className="text-xs text-red-300 font-medium mb-3">{t.logoutConfirm}</p>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-1.5 px-3 rounded-lg bg-dark-card text-xs text-slate-300 border border-dark-border"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-500 text-xs text-white font-semibold"
              >
                {t.logout}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-dark-card hover:bg-red-500/10 text-red-400 hover:text-red-300 border border-dark-border hover:border-red-500/25 font-medium text-xs flex items-center justify-center space-x-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.logout}</span>
          </button>
        )}

      </div>
    </div>
  );
};
