import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, UserPlus, UserMinus } from 'lucide-react';
import { apiService } from '../services/apiServices';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";


function DataKendaraan() {
  const [kendaraan, setKendaraan] = useState([]);
  const [borrowers, setBorrowers] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKeterangan, setFilterKeterangan] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [showBorrowersModal, setShowBorrowersModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedKendaraan, setSelectedKendaraan] = useState(null);
  const [currentBorrowers, setCurrentBorrowers] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    namaKendaraan: '',
    nomorPlat: '',
    satker: '',
    tanggalPajak: '',
    keterangan: 'Roda Dua'
  });
  const [borrowFormData, setBorrowFormData] = useState({
    nama_peminjam: '',
    keperluan: ''
  });

  // Load kendaraan data
  useEffect(() => {
    loadKendaraan();
  }, []);

  const loadKendaraan = async () => {
    setLoading(true);
    try {
      const response = await apiService.getKendaraan();
      if (response.success) {
        setKendaraan(response.data);
        // Load borrowers for each kendaraan
        loadAllBorrowers(response.data);
      }
    } catch (err) {
      console.error('Error loading kendaraan:', err);
      alert('Gagal memuat data kendaraan');
    } finally {
      setLoading(false);
    }
  };

  const loadAllBorrowers = async (kendaraanList) => {
    const borrowersData = {};
    for (const item of kendaraanList) {
      try {
        const response = await apiService.getBorrowersKendaraan(item.id);
        console.log(`Borrowers for ${item.id}:`, response.data);
        if (response.success && response.data.length > 0) {
          borrowersData[item.id] = response.data;
        }
      } catch (error) {
        console.error(`Error loading borrowers for ${item.id}:`, error);
      }
    }
    console.log('All borrowers loaded:', borrowersData);
    setBorrowers(borrowersData);
  };

  // Filter kendaraan
  const filteredKendaraan = kendaraan.filter(item => {
    const matchesSearch = 
      item.namaKendaraan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nomorPlat?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.satker?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKeterangan = filterKeterangan === 'all' || item.keterangan === filterKeterangan;
    return matchesSearch && matchesKeterangan;
  });

  // Handle backup PDF
  const handleBackupPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('DAFTAR KENDARAAN DINAS', 105, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const today = new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    doc.text(`Tanggal Cetak: ${today}`, 105, 22, { align: 'center' });
    
    // Summary statistics
    const rodaDua = kendaraan.filter(k => k.keterangan === 'Roda Dua').length;
    const rodaEmpat = kendaraan.filter(k => k.keterangan === 'Roda Empat').length;
    const pajakExpired = kendaraan.filter(k => {
      const diffDays = Math.ceil((new Date(k.tanggalPajak) - new Date()) / (1000 * 60 * 60 * 24));
      return diffDays < 0;
    }).length;
    
    doc.setFontSize(9);
    doc.text(`Total Kendaraan: ${kendaraan.length} | Roda Dua: ${rodaDua} | Roda Empat: ${rodaEmpat} | Pajak Kadaluarsa: ${pajakExpired}`, 14, 30);
    
    // Table data
    const tableData = filteredKendaraan.map((item, index) => {
      const pajakStatus = getPajakStatus(item.tanggalPajak);
      return [
        index + 1,
        item.namaKendaraan,
        item.nomorPlat,
        item.satker,
        new Date(item.tanggalPajak).toLocaleDateString('id-ID'),
        pajakStatus.text,
        item.keterangan
      ];
    });
    
    // Generate table
    autoTable(doc, {
      startY: 35,
      head: [['No', 'Nama Kendaraan', 'Nomor Plat', 'Satker', 'Tgl Pajak', 'Status Pajak', 'Jenis']],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 25, halign: 'center', font: 'courier' },
        3: { cellWidth: 35 },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 25, halign: 'center' },
        6: { cellWidth: 20, halign: 'center' }
      },
      didParseCell: function(data) {
        // Color code status pajak
        if (data.column.index === 5 && data.section === 'body') {
          const statusText = data.cell.text[0];
          if (statusText === 'Kadaluarsa') {
            data.cell.styles.textColor = [220, 38, 38];
            data.cell.styles.fontStyle = 'bold';
          } else if (statusText.includes('hari lagi')) {
            data.cell.styles.textColor = [234, 179, 8];
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.textColor = [22, 163, 74];
          }
        }
        // Color code keterangan
        if (data.column.index === 6 && data.section === 'body') {
          const jenis = data.cell.text[0];
          if (jenis === 'Roda Dua') {
            data.cell.styles.fillColor = [219, 234, 254];
            data.cell.styles.textColor = [30, 64, 175];
          } else {
            data.cell.styles.fillColor = [243, 232, 255];
            data.cell.styles.textColor = [107, 33, 168];
          }
          data.cell.styles.fontStyle = 'bold';
        }
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Halaman ${i} dari ${pageCount}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Save PDF
    const fileName = `Data_Kendaraan_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    alert('PDF berhasil diunduh!');
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.namaKendaraan || !formData.nomorPlat || !formData.satker || !formData.tanggalPajak) {
      alert('Mohon lengkapi semua field');
      return;
    }

    setLoading(true);
    try {
      if (editMode) {
        const response = await apiService.updateKendaraan(formData);
        if (response.success) {
          alert('Kendaraan berhasil diupdate!');
          resetForm();
          loadKendaraan();
        }
      } else {
        const response = await apiService.addKendaraan(formData);
        if (response.success) {
          alert('Kendaraan berhasil ditambahkan!');
          resetForm();
          loadKendaraan();
        }
      }
    } catch (err) {
      console.error('Error saving kendaraan:', err);
      alert('Gagal menyimpan data kendaraan');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      namaKendaraan: item.namaKendaraan,
      nomorPlat: item.nomorPlat,
      satker: item.satker,
      tanggalPajak: item.tanggalPajak,
      keterangan: item.keterangan
    });
    setEditMode(true);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kendaraan ini?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.deleteKendaraan(id);
      if (response.success) {
        alert('Kendaraan berhasil dihapus!');
        loadKendaraan();
      }
    } catch (err) {
      console.error('Error deleting kendaraan:', err);
      alert('Gagal menghapus kendaraan');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: null,
      namaKendaraan: '',
      nomorPlat: '',
      satker: '',
      tanggalPajak: '',
      keterangan: 'Roda Dua'
    });
    setEditMode(false);
    setShowModal(false);
  };

  const resetBorrowForm = () => {
    setBorrowFormData({
      nama_peminjam: '',
      keperluan: ''
    });
    setShowBorrowModal(false);
    setSelectedKendaraan(null);
  };

  // Handle borrow
  const handleBorrow = (item) => {
    setSelectedKendaraan(item);
    setShowBorrowModal(true);
  };

  const handleSubmitBorrow = async (e) => {
    e.preventDefault();
    
    if (!borrowFormData.nama_peminjam || !borrowFormData.keperluan) {
      alert('Mohon lengkapi semua field');
      return;
    }

    setLoading(true);
    try {
      const borrowData = {
        kendaraan_id: selectedKendaraan.id,
        namaKendaraan: selectedKendaraan.namaKendaraan,
        nomorPlat: selectedKendaraan.nomorPlat,
        nama_peminjam: borrowFormData.nama_peminjam,
        keperluan: borrowFormData.keperluan
      };

      console.log('Submitting borrow data:', borrowData);
      const response = await apiService.borrowKendaraan(borrowData);
      console.log('Borrow response:', response);
      
      if (response.success) {
        alert('Kendaraan berhasil dipinjam!');
        resetBorrowForm();
        // Force reload to refresh borrowers list
        await loadKendaraan();
      }
    } catch (err) {
      console.error('Error borrowing kendaraan:', err);
      alert('Gagal meminjam kendaraan');
    } finally {
      setLoading(false);
    }
  };

  // Handle show borrowers
  const handleShowBorrowers = async (item) => {
    setSelectedKendaraan(item);
    const response = await apiService.getBorrowersKendaraan(item.id);
    if (response.success) {
      setCurrentBorrowers(response.data);
      setShowBorrowersModal(true);
    }
  };

  // Handle return kendaraan
  const handleReturn = async (borrowId) => {
    if (!window.confirm('Apakah kendaraan sudah dikembalikan?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.returnKendaraan(borrowId);
      if (response.success) {
        alert('Kendaraan berhasil dikembalikan!');
        loadKendaraan();
        // Refresh borrowers list
        const updatedResponse = await apiService.getBorrowersKendaraan(selectedKendaraan.id);
        if (updatedResponse.success) {
          setCurrentBorrowers(updatedResponse.data);
        }
      }
    } catch (err) {
      console.error('Error returning kendaraan:', err);
      alert('Gagal mengembalikan kendaraan');
    } finally {
      setLoading(false);
    }
  };

  // Check if pajak is expired or near expiration
  const getPajakStatus = (tanggalPajak) => {
    const today = new Date();
    const pajakDate = new Date(tanggalPajak);
    const diffTime = pajakDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { status: 'expired', text: 'Kadaluarsa', color: 'bg-red-100 text-red-800' };
    } else if (diffDays <= 30) {
      return { status: 'warning', text: `${diffDays} hari lagi`, color: 'bg-yellow-100 text-yellow-800' };
    } else {
      return { status: 'active', text: 'Aktif', color: 'bg-green-100 text-green-800' };
    }
  };

  // Handle navigation
  const handleNavigation = (path) => {
    window.location.href = path;
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
                  onClick={() => handleNavigation('/')}
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
                >
                  Data Barang
                </button>
                <button
                  onClick={() => handleNavigation('/inputbarang')}
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
                >
                  Input Barang
                </button>
                <button
                  className="border-green-500 text-gray-900 whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200"
                >
                  Kendaraan
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="sm:flex sm:items-center sm:justify-between mb-6">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Data Kendaraan Dinas
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Kelola data kendaraan dan pajak
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Kendaraan
                </button>
              </div>

              {/* Search and Filter */}
              <div className="mb-4 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleBackupPDF}
                  className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200"
                >
                  📄 Backup PDF
                </button>

                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari kendaraan, plat, atau satker..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                  />
                </div>
                <select
                  value={filterKeterangan}
                  onChange={(e) => setFilterKeterangan(e.target.value)}
                  className="block w-full sm:w-48 pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="Roda Dua">Roda Dua</option>
                  <option value="Roda Empat">Roda Empat</option>
                </select>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Kendaraan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nomor Plat
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Satker
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Pajak
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status Pajak
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Keterangan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Peminjam
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredKendaraan.map((item, index) => {
                      const pajakStatus = getPajakStatus(item.tanggalPajak);
                      const itemBorrowers = borrowers[item.id] || [];
                      return (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.namaKendaraan}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-mono font-semibold">{item.nomorPlat}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.satker}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(item.tanggalPajak).toLocaleDateString('id-ID')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${pajakStatus.color}`}>
                              {pajakStatus.text}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              item.keterangan === 'Roda Dua' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {item.keterangan}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {itemBorrowers.length > 0 ? (
                              <button
                                onClick={() => handleShowBorrowers(item)}
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                {itemBorrowers.length} peminjam
                              </button>
                            ) : (
                              <span className="text-gray-400 italic">Tersedia</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleBorrow(item)}
                                className="text-green-600 hover:text-green-900"
                                title="Pinjam"
                              >
                                <UserPlus className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEdit(item)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Hapus"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredKendaraan.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">Tidak ada data kendaraan</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editMode ? 'Edit Kendaraan' : 'Tambah Kendaraan'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Kendaraan *
                </label>
                <input
                  type="text"
                  value={formData.namaKendaraan}
                  onChange={(e) => setFormData({ ...formData, namaKendaraan: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-3 py-2 border"
                  placeholder="Contoh: Honda Beat"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nomor Plat *
                </label>
                <input
                  type="text"
                  value={formData.nomorPlat}
                  onChange={(e) => setFormData({ ...formData, nomorPlat: e.target.value.toUpperCase() })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-3 py-2 border font-mono"
                  placeholder="Contoh: B 1234 XYZ"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Satker *
                </label>
                <input
                  type="text"
                  value={formData.satker}
                  onChange={(e) => setFormData({ ...formData, satker: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-3 py-2 border"
                  placeholder="Contoh: Dinas Pendidikan"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Tanggal Pajak *
                </label>
                <input
                  type="date"
                  value={formData.tanggalPajak}
                  onChange={(e) => setFormData({ ...formData, tanggalPajak: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-3 py-2 border"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Keterangan *
                </label>
                <select
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-3 py-2 border"
                  required
                >
                  <option value="Roda Dua">Roda Dua</option>
                  <option value="Roda Empat">Roda Empat</option>
                </select>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : editMode ? 'Update' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Borrow */}
      {showBorrowModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Pinjam Kendaraan
              </h3>
              <button
                onClick={resetBorrowForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedKendaraan && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">{selectedKendaraan.namaKendaraan}</p>
                <p className="text-sm text-gray-600 font-mono">{selectedKendaraan.nomorPlat}</p>
              </div>
            )}

            <form onSubmit={handleSubmitBorrow} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Peminjam *
                </label>
                <input
                  type="text"
                  value={borrowFormData.nama_peminjam}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, nama_peminjam: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-3 py-2 border"
                  placeholder="Nama lengkap peminjam"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Keperluan *
                </label>
                <textarea
                  value={borrowFormData.keperluan}
                  onChange={(e) => setBorrowFormData({ ...borrowFormData, keperluan: e.target.value })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 sm:text-sm px-3 py-2 border"
                  placeholder="Tujuan peminjaman"
                  rows="3"
                  required
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Memproses...' : 'Pinjam'}
                </button>
                <button
                  type="button"
                  onClick={resetBorrowForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Borrowers List */}
      {showBorrowersModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Daftar Peminjam
              </h3>
              <button
                onClick={() => setShowBorrowersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {selectedKendaraan && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm font-medium text-gray-700">{selectedKendaraan.namaKendaraan}</p>
                <p className="text-sm text-gray-600 font-mono">{selectedKendaraan.nomorPlat}</p>
              </div>
            )}

            <div className="space-y-3">
              {currentBorrowers.length > 0 ? (
                currentBorrowers.map((borrower) => (
                  <div key={borrower.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{borrower.nama_peminjam}</p>
                        <p className="text-sm text-gray-600 mt-1">{borrower.keperluan}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Dipinjam: {new Date(borrower.tanggal_pinjam).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleReturn(borrower.id)}
                        className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        title="Kembalikan"
                      >
                        <UserMinus className="h-3 w-3 mr-1" />
                        Kembalikan
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">Tidak ada peminjam</p>
              )}
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowBorrowersModal(false)}
                className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors duration-200"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataKendaraan;