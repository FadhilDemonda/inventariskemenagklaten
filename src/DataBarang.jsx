import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Users } from 'lucide-react';
import InputBarang from './InputBarang';

function DataBarang() {
  const dropdownRef = useRef(null);
  const [activeMenu, setActiveMenu] = useState('data');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPinjamModal, setShowPinjamModal] = useState(false);
  const [showPeminjamModal, setShowPeminjamModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Data pinjaman sementara (frontend only)
  const [pinjamData, setPinjamData] = useState({
    namaPeminjam: '',
    suratPinjam: ''
  });
  
  // Data peminjam untuk demo
  const dataPeminjam = {
    1: [
      { nama: 'Ahmad Supandi', surat: 'SP-001/2024', tanggal: '2024-09-15', jumlah: 1 },
      { nama: 'Siti Rahmah', surat: 'SP-002/2024', tanggal: '2024-09-12', jumlah: 1 }
    ],
    2: [
      { nama: 'Budi Santoso', surat: 'SP-003/2024', tanggal: '2024-09-10', jumlah: 2 }
    ],
    3: [
      { nama: 'Indra Kurniawan', surat: 'SP-004/2024', tanggal: '2024-09-12', jumlah: 1 }
    ]
  };

  // Default status dengan warna
  const defaultStatuses = [
    { name: 'Tersedia', color: 'bg-green-100 text-green-800', bgColor: 'green' },
    { name: 'Digunakan', color: 'bg-yellow-100 text-yellow-800', bgColor: 'yellow' },
    { name: 'Rusak', color: 'bg-red-100 text-red-800', bgColor: 'red' }
  ];

  const [customStatuses, setCustomStatuses] = useState([]);

  // Data inventaris sementara (frontend only)
  const inventory = [
    {
      id: 1,
      name: 'Laptop Dell Inspiron 15',
      status: 'Tersedia',
      totalQty: 10,
      availableQty: 8,
      usedQty: 2,
      lastUpdate: '2024-09-15'
    },
    {
      id: 2,
      name: 'Toyota Avanza 2020',
      status: 'Digunakan',
      totalQty: 2,
      availableQty: 0,
      usedQty: 2,
      lastUpdate: '2024-09-10'
    },
    {
      id: 3,
      name: 'Honda Vario 150',
      status: 'Tersedia',
      totalQty: 4,
      availableQty: 3,
      usedQty: 1,
      lastUpdate: '2024-09-12'
    },
    {
      id: 4,
      name: 'Kabel LAN Cat6',
      status: 'Tersedia',
      totalQty: 75,
      availableQty: 50,
      usedQty: 25,
      lastUpdate: '2024-09-08'
    },
    {
      id: 5,
      name: 'Monitor Samsung 24"',
      status: 'Rusak',
      totalQty: 8,
      availableQty: 5,
      usedQty: 3,
      lastUpdate: '2024-09-05'
    }
  ];

  // Effect untuk menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gabungkan status default dan custom
  const allStatuses = [...defaultStatuses, ...customStatuses];

  // Fungsi untuk mendapatkan warna status
  const getStatusColor = (status) => {
    const statusObj = allStatuses.find(s => s.name === status);
    return statusObj ? statusObj.color : 'bg-gray-100 text-gray-800';
  };

  // Filter inventory berdasarkan search dan status
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Fungsi untuk menangani dropdown
  const handleDropdownAction = (action, item) => {
    if (action === 'pinjam') {
      setSelectedItem(item);
      setShowPinjamModal(true);
    } else if (action === 'edit') {
      setEditingItem({ ...item });
      setShowEditModal(true);
    }
    setOpenDropdown(null);
  };

  // Fungsi untuk melihat peminjam
  const handleLihatPeminjam = (item) => {
    setSelectedItem(item);
    setShowPeminjamModal(true);
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
                  onClick={() => setActiveMenu('data')}
                  className={`${activeMenu === 'data' 
                    ? 'border-blue-500 text-gray-900' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                >
                  Data Barang
                </button>
                <button
                  onClick={() => setActiveMenu('input')}
                  className={`${activeMenu === 'input' 
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
        {activeMenu === 'data' ? (
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="sm:flex sm:items-center sm:justify-between mb-6">
                  <div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Daftar Inventaris Kantor
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Kelola dan pantau status barang kantor
                    </p>
                  </div>
                </div>

                {/* Search and Filter */}
                <div className="mb-4 flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari nama barang..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  <div className="relative">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="all">Semua Status</option>
                      {allStatuses.map((status, index) => (
                        <option key={index} value={status.name}>{status.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nama Barang
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status Barang
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total Jumlah
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jumlah Tersedia
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Jumlah Digunakan
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal Update
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredInventory.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.totalQty || (item.availableQty + item.usedQty)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-medium text-green-600">
                                {item.availableQty}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-medium text-orange-600">
                                {item.usedQty}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(item.lastUpdate).toLocaleDateString('id-ID')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center gap-2">
                                {/* Dropdown Aksi */}
                                <div className="relative">
                                  <button
                                    onClick={() => setOpenDropdown(openDropdown === item.id ? null : item.id)}
                                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  >
                                    Aksi
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                  </button>
                                  
                                  {openDropdown === item.id && (
                                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                      <div className="py-1">
                                        <button
                                          onClick={() => handleDropdownAction('pinjam', item)}
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          Pinjam Barang
                                        </button>
                                        <button
                                          onClick={() => handleDropdownAction('edit', item)}
                                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          Ubah Jumlah Total
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                {/* Tombol Lihat Peminjam */}
                                <button
                                  onClick={() => handleLihatPeminjam(item)}
                                  className="inline-flex items-center p-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                  title="Lihat Daftar Peminjam"
                                >
                                  <Users className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {filteredInventory.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Tidak ada barang yang ditemukan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <InputBarang 
            allStatuses={allStatuses}
            customStatuses={customStatuses}
            setCustomStatuses={setCustomStatuses}
          />
        )}
      </div>

      {/* Modal Edit - Ubah Jumlah Total */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Ubah Jumlah Total: {editingItem.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status Barang
                  </label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                  >
                    {allStatuses.map((status, index) => (
                      <option key={index} value={status.name}>{status.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Jumlah Barang
                  </label>
                  <input
                    type="number"
                    value={editingItem.totalQty || (editingItem.availableQty + editingItem.usedQty)}
                    onChange={(e) => setEditingItem({ 
                      ...editingItem, 
                      totalQty: parseInt(e.target.value) || 0 
                    })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    min="0"
                  />
                </div>
                
                {/* Info Current */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Saat ini:</span>
                    <div className="mt-1 space-y-1">
                      <div><span className="text-gray-600">Sedang Digunakan: </span><span className="font-medium text-orange-600">{editingItem.usedQty}</span></div>
                      <div><span className="text-gray-600">Akan Tersedia: </span><span className="font-medium text-green-600">
                        {Math.max(
                          (editingItem.totalQty || (editingItem.availableQty + editingItem.usedQty)) - 
                          (editingItem.usedQty || 0), 
                          0
                        )}
                      </span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    alert('Update berhasil! (Frontend Demo)');
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200"
                >
                  Update
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pinjam Barang */}
      {showPinjamModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Pinjam Barang: {selectedItem.name}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nama Peminjam
                  </label>
                  <input
                    type="text"
                    value={pinjamData.namaPeminjam}
                    onChange={(e) => setPinjamData({ ...pinjamData, namaPeminjam: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="Masukkan nama peminjam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nomor Surat Pinjaman
                  </label>
                  <input
                    type="text"
                    value={pinjamData.suratPinjam}
                    onChange={(e) => setPinjamData({ ...pinjamData, suratPinjam: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-3 py-2 border"
                    placeholder="Contoh: SP-001/2024"
                  />
                </div>
                
                {/* Info Barang */}
                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Informasi Barang:</span>
                    <div className="mt-1 space-y-1">
                      <div><span className="text-gray-600">Tersedia: </span><span className="font-medium text-green-600">{selectedItem.availableQty}</span></div>
                      <div><span className="text-gray-600">Sedang Digunakan: </span><span className="font-medium text-orange-600">{selectedItem.usedQty}</span></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => {
                    alert(`Barang berhasil dipinjam oleh ${pinjamData.namaPeminjam}! (Frontend Demo)`);
                    setShowPinjamModal(false);
                    setSelectedItem(null);
                    setPinjamData({ namaPeminjam: '', suratPinjam: '' });
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200"
                >
                  Submit
                </button>
                <button
                  onClick={() => {
                    setShowPinjamModal(false);
                    setSelectedItem(null);
                    setPinjamData({ namaPeminjam: '', suratPinjam: '' });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Lihat Peminjam */}
      {showPeminjamModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Daftar Peminjam: {selectedItem.name}
              </h3>
              
              {dataPeminjam[selectedItem.id] ? (
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama Peminjam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No. Surat
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tanggal Pinjam
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dataPeminjam[selectedItem.id].map((peminjam, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {peminjam.nama}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {peminjam.surat}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(peminjam.tanggal).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {peminjam.jumlah}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada peminjam</h3>
                  <p className="mt-1 text-sm text-gray-500">Barang ini belum dipinjam oleh siapapun.</p>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowPeminjamModal(false);
                    setSelectedItem(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataBarang;