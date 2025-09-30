// API base URL menggunakan Netlify Functions sebagai proxy
const API_BASE_URL = '/.netlify/functions/api-proxy';

// API service functions
export const apiService = {
  // Items endpoints
  async getItems() {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=read.php`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching items:', error);
      return { success: false, message: error.message };
    }
  },

  async createItem(itemData) {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=create.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating item:', error);
      return { success: false, message: error.message };
    }
  },

  async updateItem(itemData) {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=update.php`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, message: error.message };
    }
  },

  // Borrowing endpoints
  async borrowItem(borrowData) {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=borrow.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(borrowData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error borrowing item:', error);
      return { success: false, message: error.message };
    }
  },

  async getBorrowers(barangId) {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=borrowers.php&barang_id=${barangId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching borrowers:', error);
      return { success: false, message: error.message };
    }
  },

  // Status endpoints
  async getStatuses() {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=status.php`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching statuses:', error);
      return { success: false, message: error.message };
    }
  },

  async createStatus(statusData) {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=status.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData)
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating status:', error);
      return { success: false, message: error.message };
    }
  },

  async deleteStatus(statusId) {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=status.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: statusId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting status:', error);
      return { success: false, message: error.message };
    }
  },

  // Delete item
  async deleteItem(itemId) {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=delete.php`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: itemId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, message: error.message };
    }
  },

  // Return borrowed item
  async returnItem(peminjamanId) {
    try {
      const response = await fetch(`${API_BASE_URL}?endpoint=return.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ peminjaman_id: peminjamanId })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error returning item:', error);
      return { success: false, message: error.message };
    }
  }
};