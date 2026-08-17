import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Phone, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  Star, 
  X, 
  Save, 
  AlertCircle,
  PhoneCall
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { EmergencyContact } from '../../types';

export const SafetyCircle: React.FC = () => {
  const { 
    emergencyContacts, 
    addEmergencyContact, 
    updateEmergencyContact, 
    deleteEmergencyContact, 
    t 
  } = useSettings();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3>(1);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setName('');
    setPhone('');
    // Auto-select lowest available priority
    const currentPriorities = emergencyContacts.map((c) => c.priority);
    if (!currentPriorities.includes(1)) setPriority(1);
    else if (!currentPriorities.includes(2)) setPriority(2);
    else setPriority(3);

    setIsAdding(true);
    setEditingId(null);
  };

  const handleOpenEdit = (contact: EmergencyContact) => {
    setName(contact.name);
    setPhone(contact.phone);
    setPriority(contact.priority);
    setEditingId(contact.id);
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingId) {
      updateEmergencyContact({
        id: editingId,
        name: name.trim(),
        phone: phone.trim(),
        priority
      });
      setEditingId(null);
    } else {
      addEmergencyContact({
        name: name.trim(),
        phone: phone.trim(),
        priority
      });
      setIsAdding(false);
    }

    setName('');
    setPhone('');
  };

  const priorityLabels = {
    1: 'Priority 1 (Primary Call)',
    2: 'Priority 2 (Secondary)',
    3: 'Priority 3 (Backup)'
  };

  const priorityColors = {
    1: 'bg-red-500/20 text-red-400 border-red-500/30',
    2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    3: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-2xl bg-red-500/15 text-red-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white">{t.sosTitle}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add trusted family or emergency contacts for instant 1-tap SOS dispatch.
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-2 transition-all active:scale-95 self-start sm:self-center"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.addContact}</span>
        </button>
      </div>

      {/* Emergency Contacts List */}
      {emergencyContacts.length === 0 ? (
        <div className="p-8 rounded-3xl bg-dark-surface border border-dark-border text-center">
          <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-3 opacity-50" />
          <h4 className="text-sm font-bold text-white mb-1">No Emergency Contacts Configured</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
            {t.noContactsYet}
          </p>
          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-5 rounded-xl bg-dark-card hover:bg-dark-hover text-brand-400 border border-dark-border text-xs font-bold transition-colors"
          >
            + Add First Emergency Contact
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {emergencyContacts.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-3xl bg-dark-surface border border-dark-border shadow-lg relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${priorityColors[c.priority]}`}>
                    {priorityLabels[c.priority]}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-hover transition-colors"
                      title={t.editContact}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-dark-hover transition-colors"
                      title={t.deleteContact}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-bold text-white mb-1">{c.name}</h4>
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.phone}</span>
                </div>
              </div>

              {/* Call Direct Link */}
              <div className="mt-4 pt-3 border-t border-dark-border flex items-center justify-between">
                <a
                  href={`tel:${c.phone}`}
                  className="flex items-center space-x-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Direct</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white">
                {editingId ? t.editContact : t.addContact}
              </h3>
              <button
                onClick={() => {
                  setIsAdding(false);
                  setEditingId(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.contactName} *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Uncle / Parent"
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.contactPhone} *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {t.contactPriority}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p as any)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        priority === p
                          ? 'bg-brand-600 text-white border-brand-500 shadow-md'
                          : 'bg-dark-card text-slate-400 border-dark-border'
                      }`}
                    >
                      Priority {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-dark-card text-slate-300 text-xs font-medium border border-dark-border"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{t.save}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-dark-surface border border-dark-border rounded-3xl p-6 shadow-2xl text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white mb-2">{t.deleteContact}?</h3>
            <p className="text-xs text-slate-400 mb-5">{t.confirmDeleteContact}</p>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 rounded-xl bg-dark-card text-xs text-slate-300 border border-dark-border"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => {
                  deleteEmergencyContact(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs text-white font-bold"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
