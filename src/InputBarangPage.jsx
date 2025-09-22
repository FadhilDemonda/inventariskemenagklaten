import React, { useState } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function InputBarangPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('data');
  
  
  // Default status dengan warna
  const defaultStatuses = [
    { name: 'Tersedia', color: 'bg-green-100 text-green-800', bgColor: 'green' },
    { name: 'Digunakan', color: 'bg-yellow-100 text-yellow-800', bgColor: 'yellow' },
    { name: 'Rusak', color: 'bg-red-100 text-red-800', bgColor: 'red' }
  ];

  const [customStatuses, setCustomStatuses] = useState([]);

  // Form data untuk input barang baru (frontend only)
  const [newItem, setNewItem] = useState({
    name: '',
    status: 'Tersedia',
    totalQty: 0,
    usedQty: 0
  });

  const [newStatusName, setNewStatusName] = useState('');

  // Gabungkan status default dan custom
  const allStatuses = [...defaultStatuses, ...customStatuses];

  // Fungsi untuk menambah status baru
  const handleAddCustomStatus = () => {
    if (!newStatusName.trim()) return;
    
    const newStatus = {
      name: newStatusName,
      color: 'bg-gray-100 text-gray-800',
      bgColor: 'gray'
    };
    
    setCustomStatuses([...customStatuses, newStatus]);
    setNewStatusName('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Inventaris Kantor</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => navigate('/')}
                  className='activeMenu'
                >
                  Data Barang
                </button>
                <button
                  onClick={() => setActiveMenu('data')}
                  className={`${activeMenu === 'data' 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  Input Barang
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Form Input Barang */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Tambah Barang Baru
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Barang
                    </label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                      placeholder="Masukkan nama barang"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status Barang
                    </label>
                    <select
                      value={newItem.status}
                      onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    >
                      {allStatuses.map((status, index) => (
                        <option key={index} value={status.name}>{status.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Total Jumlah
                      </label>
                      <input
                        type="number"
                        value={newItem.totalQty}
                        onChange={(e) => setNewItem({ ...newItem, totalQty: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                        min="0"
                        placeholder="Total barang"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Jumlah Digunakan
                      </label>
                      <input
                        type="number"
                        value={newItem.usedQty}
                        onChange={(e) => setNewItem({ ...newItem, usedQty: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                        min="0"
                        max={newItem.totalQty}
                        placeholder="Yang sedang digunakan"
                      />
                    </div>
                  </div>
                  
                  {/* Preview Jumlah Tersedia */}
                  {(newItem.totalQty > 0 || newItem.usedQty > 0) && (
                    <div className="bg-blue-50 p-3 rounded-md">
                      <div className="text-sm">
                        <span className="font-medium text-gray-700">Preview:</span>
                        <div className="mt-1">
                          <span className="text-blue-600">Jumlah Tersedia: </span>
                          <span className="font-semibold text-green-600">
                            {Math.max((parseInt(newItem.totalQty) || 0) - (parseInt(newItem.usedQty) || 0), 0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        alert('Tambah Barang berhasil! (Frontend Demo)');
                        setNewItem({
                          name: '',
                          status: 'Tersedia',
                          totalQty: 0,
                          usedQty: 0
                        });
                      }}
                      className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Barang
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItem({
                        name: '',
                        status: 'Tersedia',
                        totalQty: 0,
                        usedQty: 0
                      })}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Tambah Status Custom */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Tambah Status Baru
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Status
                    </label>
                    <input
                      type="text"
                      value={newStatusName}
                      onChange={(e) => setNewStatusName(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                      placeholder="Masukkan nama status baru"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        handleAddCustomStatus();
                        alert(`Status "${newStatusName}" berhasil ditambahkan! (Frontend Demo)`);
                      }}
                      className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Status
                    </button>
                    <button
                      onClick={() => setNewStatusName('')}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Daftar Status */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Status yang Tersedia:</h4>
                  <div className="flex flex-wrap gap-2">
                    {allStatuses.map((status, index) => (
                      <span key={index} className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                        {status.name}
                      </span>
                    ))}
                  </div>
                </div>

                {customStatuses.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Status Custom yang Ditambahkan:</h4>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <div className="flex flex-wrap gap-2">
                        {customStatuses.map((status, index) => (
                          <span key={index} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-200 text-gray-800">
                            {status.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Panduan Input Barang
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Isi nama barang dengan lengkap dan jelas</li>
                    <li>Pilih status sesuai kondisi barang saat ini</li>
                    <li>Total jumlah adalah keseluruhan barang yang dimiliki</li>
                    <li>Jumlah digunakan adalah barang yang sedang dipinjam/dipakai</li>
                    <li>Sistem akan otomatis menghitung jumlah yang tersedia</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InputBarangPage;