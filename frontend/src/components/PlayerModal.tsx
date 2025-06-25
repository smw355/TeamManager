import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Player } from '../types';
import ApiService from '../services/api';

interface PlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  player?: Player | null;
  onSaved: () => void;
}

const PlayerModal: React.FC<PlayerModalProps> = ({ isOpen, onClose, player, onSaved }) => {
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    position: '',
    birthDate: '',
    emergencyContact: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const positions = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

  useEffect(() => {
    if (isOpen) {
      if (player) {
        setFormData({
          name: player.name || '',
          number: player.number?.toString() || '',
          position: player.position || '',
          birthDate: player.birth_date || '',
          emergencyContact: player.emergency_contact || ''
        });
      } else {
        setFormData({
          name: '',
          number: '',
          position: '',
          birthDate: '',
          emergencyContact: ''
        });
      }
      setError(null);
    }
  }, [isOpen, player]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const playerData = {
        name: formData.name,
        team_id: 'team1',
        number: formData.number ? parseInt(formData.number) : null,
        position: formData.position || null,
        birth_date: formData.birthDate || null,
        emergency_contact: formData.emergencyContact || null,
        parent_ids: []
      };

      if (player) {
        await ApiService.updatePlayer('team1', player.id, playerData);
      } else {
        await ApiService.createPlayer('team1', playerData);
      }

      onSaved();
    } catch (err: any) {
      setError(err.message || 'Failed to save player');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {player ? 'Edit Player' : 'Add New Player'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Player Name *
            </label>
            <input
              type="text"
              id="name"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
              placeholder="Enter player name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-gray-700 mb-1">
                Jersey Number
              </label>
              <input
                type="number"
                id="number"
                min="1"
                max="99"
                value={formData.number}
                onChange={(e) => handleInputChange('number', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
                placeholder="##"
              />
            </div>

            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <select
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
              >
                <option value="">Select position</option>
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
              Birth Date
            </label>
            <input
              type="date"
              id="birthDate"
              value={formData.birthDate}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Contact
            </label>
            <input
              type="text"
              id="emergencyContact"
              value={formData.emergencyContact}
              onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-tiko-blue focus:border-transparent"
              placeholder="Parent Name - Phone Number"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-4 py-2 bg-tiko-blue text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (player ? 'Update Player' : 'Add Player')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlayerModal;