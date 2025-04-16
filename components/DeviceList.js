import axios from 'axios';

export default function DeviceList({ devices, onUpdate, page, totalPages, setPage }) {
  const toggleDevice = async (id, isActive) => {
    try {
      await axios.patch(
        `/api/devices/${id}`,
        { isActive: !isActive },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      onUpdate();
    } catch (error) {
      console.error('Error updating device:', error);
    }
  };

  return (
    <div>
      <h2 className="text-xl mb-4">Devices</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="p-2 border">Serial Number</th>
            <th className="p-2 border">Company</th>
            <th className="p-2 border">API URL</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((device) => (
            <tr key={device._id}>
              <td className="p-2 border">{device.serialNumber}</td>
              <td className="p-2 border">{device.companyId?.name}</td>
              <td className="p-2 border">{device.apiUrl}</td>
              <td className="p-2 border">{device.isActive ? 'Active' : 'Inactive'}</td>
              <td className="p-2 border">
                <button
                  onClick={() => toggleDevice(device._id, device.isActive)}
                  className="p-1 bg-blue-500 text-white rounded"
                >
                  {device.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-between">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="p-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Previous
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="p-2 bg-gray-300 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}