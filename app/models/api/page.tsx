"use client";
import { useState, useEffect } from 'react';
import { getAbsoluteUrl } from '../../utils/url';
import { Button, Card, TextInput, Modal } from 'flowbite-react';
import { HiPlus, HiTrash, HiClipboardCopy } from 'react-icons/hi';

interface ApiKey {
  id: number;
  name: string;
  key: string;
  created_at: string;
}

export const metadata = {
  title: 'API Keys',
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [keyToDelete, setKeyToDelete] = useState<ApiKey | null>(null);

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

  const confirmDelete = (key: ApiKey) => {
    setKeyToDelete(key);
    setShowModal(true);
  };

  const handleDeleteKey = async () => {
    if (!keyToDelete) return;
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(getAbsoluteUrl(`/api/apikeys/${keyToDelete.id}/`), {
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
    } finally {
      setShowModal(false);
      setKeyToDelete(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <div className="flex items-center">
          <TextInput
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="New key name"
            className="mr-2"
          />
          <Button onClick={handleCreateKey} color="blue">
            <HiPlus className="mr-2 h-5 w-5" />
            Create Key
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {keys.map((key) => (
          <Card key={key.id}>
            <div className="flex justify-between items-start">
              <div>
                <h5 className="text-xl font-bold tracking-tight text-gray-900">
                  {key.name}
                </h5>
                <p className="font-normal text-gray-700">
                  Created: {new Date(key.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center">
                <TextInput
                  type="text"
                  value={`Bearer ${key.key}`}
                  readOnly
                  className="w-96 mr-2"
                />
                <Button
                  color="gray"
                  onClick={() => copyToClipboard(`Bearer ${key.key}`)}
                  className="mr-2"
                >
                  <HiClipboardCopy className="h-5 w-5" />
                </Button>
                <Button color="failure" onClick={() => confirmDelete(key)}>
                  <HiTrash className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <Modal.Header>Confirm Deletion</Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete the key "{keyToDelete?.name}"?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button color="failure" onClick={handleDeleteKey}>
            Delete
          </Button>
          <Button color="gray" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
