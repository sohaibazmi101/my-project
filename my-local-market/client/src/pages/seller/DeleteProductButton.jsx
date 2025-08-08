import api from '../../services/api';

function DeleteProductButton({ productId, onDeleted }) {
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.delete(`/products/${productId}/delete`);
      alert('Product deleted');
      if (onDeleted) onDeleted(productId);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  return (
    <button
      className="btn btn-danger btn-sm"
      onClick={handleDelete}
      title="Delete product"
    >
      Delete
    </button>
  );
}

export default DeleteProductButton;
