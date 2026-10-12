import React, { useState } from 'react';
import { Calendar, Clock, Check, Plus, Trash2, AlertCircle } from 'lucide-react';
import { workerService } from '../../services/workerService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const WorkerAvailabilityPage = () => {
  const { workerProfile, refreshUser } = useAuth();
  const { addToast } = useToast();

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [selectedDays, setSelectedDays] = useState(
    workerProfile?.availability?.days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  );
  const [startTime, setStartTime] = useState(workerProfile?.availability?.workingHours?.start || '09:00');
  const [endTime, setEndTime] = useState(workerProfile?.availability?.workingHours?.end || '19:00');
  const [unavailableDates, setUnavailableDates] = useState(
    workerProfile?.availability?.unavailableDates || []
  );
  const [newDateInput, setNewDateInput] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const addUnavailableDate = () => {
    if (!newDateInput) return;
    if (!unavailableDates.includes(newDateInput)) {
      setUnavailableDates([...unavailableDates, newDateInput]);
      setNewDateInput('');
    }
  };

  const removeUnavailableDate = (date) => {
    setUnavailableDates(unavailableDates.filter((d) => d !== date));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await workerService.updateWorkerProfile({
        availability: {
          days: selectedDays,
          workingHours: {
            start: startTime,
            end: endTime,
          },
          unavailableDates,
        },
      });
      addToast('Availability schedule saved successfully', 'success');
      refreshUser();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update schedule', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Working Schedule & Availability
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Define when customers can book appointments with you to avoid scheduling conflicts
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Working Days */}
        <div>
          <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-1.5 text-brand-600" /> Active Working Days
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {allDays.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`p-3 rounded-2xl text-xs font-bold border transition flex flex-col items-center justify-center space-y-1 ${
                    isSelected
                      ? 'bg-brand-50 border-brand-500 text-brand-700 shadow-sm'
                      : 'border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <span>{day.slice(0, 3)}</span>
                  <span className="text-[10px] font-medium">{isSelected ? 'Active' : 'Off'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Working Hours */}
        <div className="pt-4 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 block mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-brand-600" /> Daily Working Hours
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Start Time</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">End Time</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Unavailable Blackout Dates */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <label className="text-xs font-bold text-slate-700 block flex items-center">
            <AlertCircle className="w-4 h-4 mr-1.5 text-amber-500" /> Blackout / Vacation Dates
          </label>
          <p className="text-xs text-slate-400">
            Select specific single dates when you are unavailable for emergency or personal leave.
          </p>

          <div className="flex items-center space-x-2 max-w-sm">
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={newDateInput}
              onChange={(e) => setNewDateInput(e.target.value)}
              className="p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 flex-1"
            />
            <button
              type="button"
              onClick={addUnavailableDate}
              className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {unavailableDates.map((date) => (
              <span
                key={date}
                className="inline-flex items-center px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200"
              >
                <span>{date}</span>
                <button
                  type="button"
                  onClick={() => removeUnavailableDate(date)}
                  className="ml-2 hover:text-rose-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition"
          >
            {loading ? 'Saving Schedule...' : 'Save Availability Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkerAvailabilityPage;
