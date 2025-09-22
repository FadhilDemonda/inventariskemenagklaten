import React, { useState } from 'react';
import { Plus } from 'lucide-react';

function InputBarang({ 
  allStatuses, 
  customStatuses, 
  setCustomStatuses 
}) {
  // Form data untuk input barang baru (frontend only)
  const [newItem, setNewItem] = useState({
    name: '',
    status: 'Tersedia',
    totalQty: 0,
    usedQty: 0
  });

  const [newStatusName, setNewStatusName] = useState('');

  return (
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
                      <span className="font-semibold">
                        {Math.max((parseInt(newItem.totalQty) || 0) - (parseInt(newItem.usedQty) || 0), 0)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Non-functional button */}
              {/* Fungsi update akan ditambahkan nanti */}
              <button
                type="button"
                onClick={() => alert('Tambah Barang berhasil! (Frontend Demo)')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Barang
              </button>
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
              
              {/* Non-functional button */}
              {/* Fungsi update akan ditambahkan nanti */}
              <button
                onClick={() => alert('Tambah Status berhasil! (Frontend Demo)')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah Status
              </button>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default InputBarang;