import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createProduct } from '../service/products'
import '../styles/add-product.css'

const initialProduct = {
  name: '', category: '', price: '', unit: '', stock: '', description: '', isAvailable: true,
}

const AddProduct = () => {
  const navigate = useNavigate()
  const [product, setProduct] = useState(initialProduct)
  const [image, setImage] = useState(null)
  const [status, setStatus] = useState({ saving: false, message: '', type: '' })

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setProduct((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!image) {
      setStatus({ saving: false, type: 'error', message: 'Please select a product image.' })
      return
    }

    setStatus({ saving: true, type: '', message: '' })
    try {
      await createProduct(product, image)
      setStatus({ saving: false, type: 'success', message: 'Product added successfully. Redirecting to the catalog…' })
      window.setTimeout(() => navigate('/home'), 900)
    } catch (error) {
      setStatus({ saving: false, type: 'error', message: error?.response?.data?.detail || 'Could not add the product. Please try again.' })
    }
  }

  return <main className="add-product-page">
    <header className="add-product-header"><Link className="brand" to="/home"><span className="brand-mark">S</span><span>stockroom</span></Link><Link className="back-link" to="/home">← Back to catalog</Link></header>
    <section className="product-form-card"><div className="form-intro"><p className="eyebrow">ADMIN ONLY</p><h1>Add a new product</h1><p>Create a product for your inventory catalog. Fields marked with * are required.</p></div><form onSubmit={handleSubmit}>
      <div className="form-grid"><label><span>Product name *</span><input name="name" value={product.name} onChange={updateField} placeholder="e.g. Organic Avocados" required /></label><label><span>Category *</span><input name="category" value={product.category} onChange={updateField} placeholder="e.g. Fresh produce" required /></label><label><span>Price *</span><input name="price" type="number" min="0" step="0.01" value={product.price} onChange={updateField} placeholder="0.00" required /></label><label><span>Unit *</span><input name="unit" value={product.unit} onChange={updateField} placeholder="e.g. 1 kg" required /></label><label><span>Stock *</span><input name="stock" type="number" min="0" step="1" value={product.stock} onChange={updateField} placeholder="0" required /></label><label className="image-input"><span>Product image *</span><input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} required /><small>{image ? image.name : 'PNG, JPG, WEBP or another image format'}</small></label></div>
      <label className="description-input"><span>Description *</span><textarea name="description" value={product.description} onChange={updateField} placeholder="Describe the product…" rows="4" required /></label><label className="availability"><input name="isAvailable" type="checkbox" checked={product.isAvailable} onChange={updateField} /><span><b>Available for sale</b><small>Customers and staff can sell this product when it is in stock.</small></span></label>{status.message && <p className={`form-message ${status.type}`}>{status.message}</p>}<div className="form-actions"><Link to="/home">Cancel</Link><button type="submit" disabled={status.saving}>{status.saving ? 'Adding product…' : 'Add product'}</button></div>
    </form></section>
  </main>
}

export default AddProduct
