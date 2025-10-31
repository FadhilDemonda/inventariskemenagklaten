import React, { useState, useEffect, useCallback } from 'react';
import { Plus} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiServices';

function InputBarangPage() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState('input');
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = React.useState(false);

  // Status states
  const [statuses, setStatuses] = useState([]);
  const [newStatusName, setNewStatusName] = useState('');

  // Form data untuk input barang baru
  const [newItem, setNewItem] = useState({
    name: '',
    status: 'Tersedia',
    totalQty: '',
    usedQty: ''
  });

  // Load statuses from API
  const loadStatuses = useCallback(async () => {
  try {
    const response = await apiService.getStatuses();
    if (response.success) {
      setStatuses(response.data);
      if (response.data.length > 0 && !newItem.status) {
        setNewItem(prev => ({ ...prev, status: response.data[0].name }));
      }
    }
  } catch (error) {
    console.error('Error loading statuses:', error);
  }
 }, [newItem.status]);

   // Load statuses on component mount
  useEffect(() => {
    loadStatuses();
  }, [loadStatuses]);

  // Handle add new item
  const handleAddItem = async () => {
    if (!newItem.name.trim()) {
      alert('Nama barang tidak boleh kosong');
      return;
    }

    if (!newItem.totalQty || parseInt(newItem.totalQty) < 0) {
      alert('Total jumlah harus diisi dan tidak boleh negatif');
      return;
    }

    const usedQty = parseInt(newItem.usedQty) || 0;
    const totalQty = parseInt(newItem.totalQty);

    if (usedQty > totalQty) {
      alert('Jumlah digunakan tidak boleh lebih besar dari total jumlah');
      return;
    }

    setLoading(true);
    try {
      const itemData = {
        name: newItem.name.trim(),
        status: newItem.status,
        totalQty: totalQty,
        usedQty: usedQty
      };

      const response = await apiService.createItem(itemData);
      
      if (response.success) {
        alert('Barang berhasil ditambahkan!');
        // Reset form
        setNewItem({
          name: '',
          status: statuses.length > 0 ? statuses[0].name : 'Tersedia',
          totalQty: '',
          usedQty: ''
        });
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      alert('Error creating item: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle add custom status
  const handleAddCustomStatus = async () => {
    if (!newStatusName.trim()) {
      alert('Nama status tidak boleh kosong');
      return;
    }

    setLoading(true);
    try {
      const statusData = {
        name: newStatusName.trim(),
        color: 'bg-gray-100 text-gray-800'
      };

      const response = await apiService.createStatus(statusData);
      
      if (response.success) {
        alert(`Status "${newStatusName}" berhasil ditambahkan!`);
        setNewStatusName('');
        await loadStatuses(); // Reload statuses
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      alert('Error creating status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle delete status
  const handleDeleteStatus = async (status) => {
    // Check if it's a protected status
    const protectedStatuses = ['Tersedia', 'Digunakan', 'Rusak'];
    if (protectedStatuses.includes(status.name)) {
      alert('Status ini tidak dapat dihapus karena merupakan status default sistem');
      return;
    }

    const confirmMessage = `Yakin ingin menghapus status "${status.name}"?\n\nJika ada barang yang menggunakan status ini, akan otomatis diubah menjadi "Tersedia".`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.deleteStatus(status.id);
      
      if (response.success) {
        alert(response.message);
        await loadStatuses(); // Reload statuses
        // Update form status if the deleted status was selected
        if (newItem.status === status.name) {
          const remainingStatuses = statuses.filter(s => s.id !== status.id);
          if (remainingStatuses.length > 0) {
            setNewItem(prev => ({ ...prev, status: remainingStatuses[0].name }));
          } else {
            setNewItem(prev => ({ ...prev, status: 'Tersedia' }));
          }
        }
      } else {
        alert('Error: ' + response.message);
      }
    } catch (error) {
      alert('Error deleting status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
     <nav className="bg-white shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex justify-between items-center h-16">
      {/* Kiri: Judul */}
      <div className="flex-shrink-0 flex items-center">
        <h1 className="text-xl font-bold text-gray-900">Inventaris Kantor</h1>
      </div>

      {/* Tombol Menu Desktop */}
      <div className="hidden sm:flex sm:space-x-8">
        <button
    onClick={() => navigate('/')}
          className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
        >
          Data Barang
        </button>
        <button
          onClick={() => navigate('/kendaraan')}
          className="border-b-2 border-green-500 text-gray-900 whitespace-nowrap py-2 px-1 font-medium text-sm transition-colors duration-200 hover:border-green-600"
        >
          Input Barang
        </button>
        <button
          onClick={() => navigate('/kendaraan')}
          className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
        >
          Kendaraan
        </button>
      </div>

      {/* Tombol Hamburger Mobile */}
      <div className="sm:hidden flex items-center">
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="text-gray-700 text-2xl"
        >
          {openMenu ? '✖' : '☰'}
        </button>
      </div>
    </div>
  </div>

  {/* Dropdown Mobile */}
  {openMenu && (
    <div className="sm:hidden px-4 pb-3 space-y-2 border-t">
      <button
      onClick={() => {
          navigate('/');
          setOpenMenu(false);
        }}
        className="block w-full text-left text-gray-700 hover:text-green-600 py-2"
      >
        Data Barang
      </button>
      <button
      onClick={() => {
          navigate('/inputbarang');
          setOpenMenu(false);
        }}
        className="block w-full text-left text-green-600 hover:text-green-600"
      >
        Input Barang
      </button>
      <button
        onClick={() => {
          navigate('/kendaraan');
          setOpenMenu(false);
        }}
        className="block w-full text-left text-gray-700 hover:text-green-600 py-2"
      >
        Kendaraan
      </button>
    </div>
  )}
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
                      {statuses.map((status) => (
                        <option key={status.id} value={status.name}>{status.name}</option>
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
                      onClick={handleAddItem}
                      disabled={loading}
                      className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {loading ? 'Menambahkan...' : 'Tambah Barang'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewItem({
                        name: '',
                        status: statuses.length > 0 ? statuses[0].name : 'Tersedia',
                        totalQty: '',
                        usedQty: ''
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
                      onClick={handleAddCustomStatus}
                      disabled={loading}
                      className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {loading ? 'Menambahkan...' : 'Tambah Status'}
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
                  <div className="text-xs text-gray-500 mb-2">
                    Klik status (kecuali yang default) untuk menghapus
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => {
                      const isProtected = ['Tersedia', 'Digunakan', 'Rusak'].includes(status.name);
                      return (
                        <span 
                          key={status.id} 
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${status.color} ${
                            isProtected 
                              ? 'cursor-default' 
                              : 'cursor-pointer hover:opacity-75 hover:scale-105 hover:shadow-md'
                          }`}
                          onClick={() => !isProtected && handleDeleteStatus(status)}
                          title={isProtected ? 'Status default tidak dapat dihapus' : 'Klik untuk menghapus status ini'}
                        >
                          {status.name}
                          {!isProtected && (
                            <span className="ml-1 text-red-600 hover:text-red-800">×</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                  {statuses.length === 0 && (
                    <p className="text-gray-500 text-sm">Belum ada status yang dibuat</p>
                  )}
                </div>
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
                    <li>Data akan tersimpan di database MySQL</li>
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