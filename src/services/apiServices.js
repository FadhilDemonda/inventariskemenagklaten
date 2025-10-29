// API base URL for Firebase Realtime Database
const API_BASE_URL = 'https://inventorisklaten-default-rtdb.firebaseio.com';

// Helper function to transform Firebase object to array
const firebaseObjectToArray = (firebaseObject) => {
  if (!firebaseObject) return [];
  return Object.keys(firebaseObject).map(key => ({
    id: key,
    ...firebaseObject[key]
  }));
};

// API service functions for Firebase
export const apiService = {
  // Items endpoints
  async getItems() {
    try {
      const response = await fetch(`${API_BASE_URL}/items.json`);
      const data = await response.json();
      // Transform the data before returning
      const itemsArray = firebaseObjectToArray(data);
      return { success: true, data: itemsArray };
    } catch (error) {
      console.error('Error fetching items:', error);
      return { success: false, message: error.message };
    }
  },

  async createItem(itemData) {
    try {
      // Calculate availableQty before sending
      const availableQty = (parseInt(itemData.totalQty) || 0) - (parseInt(itemData.usedQty) || 0);
      const dataToSend = {
        ...itemData,
        availableQty: Math.max(0, availableQty),
        lastUpdate: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/items.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating item:', error);
      return { success: false, message: error.message };
    }
  },

  async updateItem(itemData) {
    try {
      // Recalculate available quantity on update
      const availableQty = (parseInt(itemData.totalQty) || 0) - (parseInt(itemData.usedQty) || 0);
      const dataToUpdate = {
        name: itemData.name,
        status: itemData.status,
        totalQty: itemData.totalQty,
        usedQty: itemData.usedQty,
        availableQty: Math.max(0, availableQty),
        lastUpdate: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/items/${itemData.id}.json`, {
        method: 'PATCH', // PATCH is better for updates, it only changes specified fields
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToUpdate)
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error updating item:', error);
      return { success: false, message: error.message };
    }
  },

  // Borrowing endpoints
  async borrowItem(borrowData) {
    try {
      // 1. Get the current item state
      const itemResponse = await fetch(`${API_BASE_URL}/items/${borrowData.barang_id}.json`);
      const item = await itemResponse.json();

      if (!item) {
        return { success: false, message: "Item not found." };
      }
      
      const newUsedQty = (parseInt(item.usedQty) || 0) + (parseInt(borrowData.jumlah_pinjam) || 0);
      const newAvailableQty = (parseInt(item.totalQty) || 0) - newUsedQty;

      if (newAvailableQty < 0) {
        return { success: false, message: "Not enough items available to borrow." };
      }

      // 2. Create the borrow record
      const borrowRecord = {
        ...borrowData,
        tanggal_pinjam: new Date().toISOString()
      };
      await fetch(`${API_BASE_URL}/borrowed_items.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(borrowRecord)
      });

      // 3. Update the item's quantities
      const itemUpdate = {
        usedQty: newUsedQty,
        availableQty: newAvailableQty,
        lastUpdate: new Date().toISOString()
      };
      await fetch(`${API_BASE_URL}/items/${borrowData.barang_id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemUpdate)
      });

      return { success: true };
    } catch (error) {
      console.error('Error borrowing item:', error);
      return { success: false, message: error.message };
    }
  },

async getBorrowers(barangId) {
  try {
    const res = await fetch(
      `${API_BASE_URL}/borrowed_items.json?orderBy="barang_id"&equalTo="${barangId}"`
    );
    const data = await res.json();

    // Convert object → array
    const borrowers = data
      ? Object.keys(data).map((key) => ({ id: key, ...data[key] }))
      : [];

    return { success: true, data: borrowers };
  } catch (err) {
    return { success: false, message: err.message };
  }
},
  
  // Return borrowed item
  async returnItem(peminjaman) {
    try {
      // 1. Get the current item state
      const itemResponse = await fetch(`${API_BASE_URL}/items/${peminjaman.barang_id}.json`);
      const item = await itemResponse.json();

      if (!item) {
        return { success: false, message: "Item not found." };
      }

      const newUsedQty = (parseInt(item.usedQty) || 0) - (parseInt(peminjaman.jumlah_pinjam) || 0);
      const newAvailableQty = (parseInt(item.totalQty) || 0) - newUsedQty;

      // 2. Delete the borrow record
      await fetch(`${API_BASE_URL}/borrowed_items/${peminjaman.id}.json`, {
        method: 'DELETE'
      });
      
      // 3. Update the item's quantities
      const itemUpdate = {
        usedQty: Math.max(0, newUsedQty),
        availableQty: newAvailableQty,
        lastUpdate: new Date().toISOString()
      };
      await fetch(`${API_BASE_URL}/items/${peminjaman.barang_id}.json`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemUpdate)
      });

      return { success: true };
    } catch (error) {
      console.error('Error returning item:', error);
      return { success: false, message: error.message };
    }
  },

  // Status endpoints
  async getStatuses() {
    try {
      const response = await fetch(`${API_BASE_URL}/statuses.json`);
      const data = await response.json();
      const statusesArray = firebaseObjectToArray(data);
      return { success: true, data: statusesArray };
    } catch (error) {
      console.error('Error fetching statuses:', error);
      return { success: false, message: error.message };
    }
  },

  async createStatus(statusData) {
    try {
      const response = await fetch(`${API_BASE_URL}/statuses.json`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statusData)
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating status:', error);
      return { success: false, message: error.message };
    }
  },
  
  async deleteStatus(statusId) {
    try {
      const response = await fetch(`${API_BASE_URL}/statuses/${statusId}.json`, {
        method: 'DELETE'
      });
      // const data = await response.json();
      return { success: true, message: "Status berhasil dihapus" };
    } catch (error) {
      console.error('Error deleting status:', error);
      return { success: false, message: error.message };
    }
  },

  // Delete item
  async deleteItem(itemId) {
    try {
      // Note: You might want to also delete related borrowed_items records if needed.
      // This implementation only deletes the main item.
      const response = await fetch(`${API_BASE_URL}/items/${itemId}.json`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error('Error deleting item:', error);
      return { success: false, message: error.message };
    }
  }
};