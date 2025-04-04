const ModalConfirmDelete: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
  error?: string;
}> = ({ isOpen, onConfirm, onCancel, message, error }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
        <p className="text-lg ">{message}</p>
        {error && <p className="text-red-500 mt-4">{error}</p>}
        {!error && message !== "Product deleted successfully!" && (
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer transition-all duration-300 ease-in-out"
            >
              No
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer transition-all duration-300 ease-in-out"
            >
              Yes
            </button>
          </div>
        )}
        {error && message !== "Product deleted successfully!" && (
          <div className="flex justify-end mt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 cursor-pointer transition-all duration-300 ease-in-out"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default ModalConfirmDelete;
