"use client";
import { useState, useEffect } from 'react';
import { getAbsoluteUrl } from '../../utils/url';

interface ApiKey {
  id: number;
  name: string;
  key: string;
  created_at: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Not authenticated');
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(getAbsoluteUrl('/api/apikeys/'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setKeys(data);
      } else {
        setError('Failed to fetch API keys');
      }
    } catch (err) {
      setError('An error occurred while fetching API keys');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    const token = localStorage.getItem('token');
    if (!token || !newKeyName.trim()) {
      return;
    }
    try {
      const response = await fetch(getAbsoluteUrl('/api/apikeys/'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newKeyName }),
      });
      if (response.ok) {
        setNewKeyName('');
        fetchKeys();
      } else {
        setError('Failed to create API key');
      }
    } catch (err) {
      setError('An error occurred while creating the API key');
    }
  };

  const handleDeleteKey = async (id: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }
    try {
      const response = await fetch(getAbsoluteUrl(`/api/apikeys/${id}/`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchKeys();
      } else {
        setError('Failed to delete API key');
      }
    } catch (err) {
      setError('An error occurred while deleting the API key');
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Keys</h1>
      <div className="mb-4">
        <input
          type="text"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          placeholder="New key name"
          className="border p-2 mr-2"
        />
        <button onClick={handleCreateKey} className="bg-blue-500 text-white p-2 rounded">
          Create Key
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {keys.map((key) => (
          <div key={key.id} className="border p-4 rounded shadow">
            <div className="font-bold">{key.name}</div>
            <div className="text-sm text-gray-500">Key: {key.key}</div>
            <div className="text-sm text-gray-500">Created: {new Date(key.created_at).toLocaleString()}</div>
            <button onClick={() => handleDeleteKey(key.id)} className="bg-red-500 text-white p-1 rounded mt-2">
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
