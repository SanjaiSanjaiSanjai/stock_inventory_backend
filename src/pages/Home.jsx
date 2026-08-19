import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createSale, getAvailableProducts } from '../service/products'
import { getCurrentUser, hasAdminRole } from '../service/currentUser'
import '../styles/home.css'

const fallbackProducts = [
  { id: 1, name: 'Organic Avocados', price: 149, category: 'Fresh produce', unit: '1 kg', description: 'Creamy, hand-picked avocados with a rich and buttery texture.', image_url: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=900&q=80', stock_balance: 36 },
  { id: 2, name: 'Arabica Coffee Beans', price: 420, category: 'Beverages', unit: '500 g', description: 'Medium-roast whole beans with notes of cocoa and caramel.', image_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80', stock_balance: 12 },
  { id: 3, name: 'Artisan Sourdough', price: 95, category: 'Bakery', unit: '1 loaf', description: 'Slow-fermented daily bread with a crisp golden crust.', image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80', stock_balance: 5 },
  { id: 4, name: 'Wildflower Honey', price: 285, category: 'Pantry', unit: '350 g', description: 'Pure, raw honey gathered from seasonal wildflowers.', image_url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=900&q=80', stock_balance: 0 },
  { id: 5, name: 'Greek Yogurt', price: 120, category: 'Dairy', unit: '400 g', description: 'Thick, strained yogurt made with simple ingredients.', image_url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80', stock_balance: 24 },
  { id: 6, name: 'Garden Basil', price: 45, category: 'Fresh produce', unit: '1 bunch', description: 'Fragrant leafy basil, freshly harvested for bright flavor.', image_url: 'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=900&q=80', stock_balance: 8 },
]

const ProductImage = ({ product, isPreview }) => {
  const [failed, setFailed] = useState(false)
  const imageSource = isPreview
    ? product.image_url
    : `http://127.0.0.1:8000${product.image_url}`

  return failed || !product.image_url ? (
    <div className="product-image product-image--empty" aria-label={`${product.name} image unavailable`}>
      <span>◒</span>
    </div>
  ) : <img className="product-image" src={imageSource} alt={product.name} onError={() => setFailed(true)} />
}

const Home = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [usingPreview, setUsingPreview] = useState(false)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All products')
  const [stockOnly, setStockOnly] = useState(false)
  const [sort, setSort] = useState('featured')
  const [selectedProducts, setSelectedProducts] = useState({})
  const [customerName, setCustomerName] = useState('')
  const [customerMobile, setCustomerMobile] = useState('')
  const [saleState, setSaleState] = useState({ submitting: false, message: '', type: '' })

  const loadProducts = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getAvailableProducts()
      const data = Array.isArray(response.data.products) ? response.data.products : response.data?.items
      if (!Array.isArray(data)) throw new Error('The products API must return a list of products.')
      setProducts(data)
      setUsingPreview(false)
    } catch (requestError) {
      setProducts(fallbackProducts)
      setUsingPreview(true)
      setError(requestError?.response?.data?.detail || 'Showing preview items while your products API is unavailable.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const initialLoad = window.setTimeout(loadProducts, 0)
    return () => window.clearTimeout(initialLoad)
  }, [])

  const currentUser = getCurrentUser()
  const userEmail = currentUser?.email || ''
  const first_letter = userEmail ? userEmail.charAt(0).toUpperCase() : ''
  const isAdmin = hasAdminRole(currentUser)

  const categories = useMemo(() => ['All products', ...new Set(products.map((item) => item.category).filter(Boolean))], [products])
  const displayedProducts = useMemo(() => {
    const result = products.filter((product) => {
      const searchable = `${product.name} ${product.category} ${product.description}`.toLowerCase()
      return searchable.includes(query.toLowerCase()) &&
        (category === 'All products' || product.category === category) &&
        (!stockOnly || product.stock_balance > 0)
    })
    if (sort === 'price-low') return result.sort((a, b) => a.price - b.price)
    if (sort === 'price-high') return result.sort((a, b) => b.price - a.price)
    if (sort === 'stock') return result.sort((a, b) => b.stock_balance - a.stock_balance)
    return result
  }, [products, query, category, stockOnly, sort])

  const totalStock = products.reduce((sum, item) => sum + Math.max(item.stock_balance || 0, 0), 0)
  const lowStock = products.filter((item) => item.stock_balance > 0 && item.stock_balance <= 10).length
  const formatPrice = (price) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(price)
  const selectedItems = useMemo(() => products.flatMap((product) => {
    const quantity = selectedProducts[product.id]
    return quantity ? [{ product, quantity }] : []
  }), [products, selectedProducts])
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0)
  const saleTotal = selectedItems.reduce((sum, { product, quantity }) => sum + (product.price * quantity), 0)

  const updateQuantity = (product, nextQuantity) => {
    const quantity = Math.min(Math.max(nextQuantity, 0), product.stock_balance)
    setSelectedProducts((current) => {
      const next = { ...current }
      if (quantity === 0) delete next[product.id]
      else next[product.id] = quantity
      return next
    })
    setSaleState({ submitting: false, message: '', type: '' })
  }

  const submitSale = async () => {
    if (!selectedItems.length || saleState.submitting) return
    if (!customerName.trim()) {
      setSaleState({ submitting: false, type: 'error', message: 'Enter the customer name before creating the sale.' })
      return
    }
    if (!customerMobile.trim()) {
      setSaleState({ submitting: false, type: 'error', message: 'Enter the customer mobile number before creating the sale.' })
      return
    }
    if (usingPreview) {
      setSaleState({ submitting: false, type: 'error', message: 'Preview products cannot be sent as a sale. Connect the products API first.' })
      return
    }
    setSaleState({ submitting: true, message: '', type: '' })
    try {
      await createSale(selectedItems, customerName.trim(), customerMobile.trim())
      setSelectedProducts({})
      setCustomerName('')
      setCustomerMobile('')
      setSaleState({ submitting: false, type: 'success', message: 'Sale created successfully.' })
      loadProducts()
    } catch (submitError) {
      setSaleState({ submitting: false, type: 'error', message: submitError?.response?.data?.detail || 'Could not create the sale. Please try again.' })
    }
  }

  return (
    <main className="catalog-shell">
      <div className="dashboard-layout">
      <aside className="app-sidebar">
        <Link className="brand" to="/home"><span className="brand-mark">S</span><span>stockroom</span></Link>
        <nav className="sidebar-nav" aria-label="Main navigation"><p>MENU</p><Link className="active" to="/home"><span>▦</span> Products</Link><Link to="/dashboard"><span>▤</span> Dashboard</Link>{isAdmin && <><p className="sidebar-section">ADMIN TOOLS</p><Link to="/add-product"><span>＋</span> Add product</Link></>}</nav>
      </aside>
      <div className="dashboard-main">
      <nav className="topbar">
        <div />
        <div className="topbar-actions"><button className="icon-button" aria-label="Notifications">♧<i /></button><div className="profile"><span className="avatar">{first_letter}</span><span>{userEmail}</span></div></div>
      </nav>

      <section className="hero">
        <div><p className="eyebrow">INVENTORY CATALOG</p><h1>Everything you need,<br /><em>right in stock.</em></h1><p className="hero-copy">Browse your available products, check inventory levels, and find exactly what you’re looking for.</p></div>
        <div className="hero-orb"><span>✦</span></div>
      </section>

      <section className="metrics" aria-label="Inventory summary">
        <div><span className="metric-icon mint">▦</span><p><b>{products.length}</b><small>Available products</small></p></div>
        <div><span className="metric-icon peach">◈</span><p><b>{totalStock}</b><small>Units in stock</small></p></div>
        <div><span className="metric-icon yellow">◷</span><p><b>{lowStock}</b><small>Low-stock items</small></p></div>
      </section>

      <section className="catalog-area">
        <div className="catalog-heading"><div><p className="eyebrow">SHOP THE CATALOG</p><h2>Available products</h2></div><button className="refresh-button" onClick={loadProducts} disabled={loading}>↻ {loading ? 'Refreshing' : 'Refresh'}</button></div>
        {error && <div className="preview-note"><span>ⓘ</span>{error}</div>}
        <div className="controls">
          <label className="search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products..." /></label>
          <label className="select-label"><select value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="stock-toggle"><input type="checkbox" checked={stockOnly} onChange={(event) => setStockOnly(event.target.checked)} /><span />In stock only</label>
          <label className="sort-label">Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}><option value="featured">Featured</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="stock">Stock level</option></select></label>
        </div>
        <p className="results-count">{displayedProducts.length} {displayedProducts.length === 1 ? 'product' : 'products'} found {usingPreview && '· Preview mode'}{selectedCount > 0 && ` · ${selectedCount} selected`}</p>
        {loading ? <div className="state-message">Loading your catalog…</div> : displayedProducts.length ? <div className="product-grid">
          {displayedProducts.map((product) => {
            const stockState = product.stock_balance <= 0 ? 'out' : product.stock_balance <= 10 ? 'low' : 'in'
            const stockLabel = stockState === 'out' ? 'Out of stock' : stockState === 'low' ? `Only ${product.stock_balance} left` : `${product.stock_balance} in stock`
            return <article className="product-card" key={product.id}>
              <div className="image-wrap"><ProductImage product={product} isPreview={usingPreview} /><span className={`stock-pill ${stockState}`}>{stockLabel}</span></div>
              <div className="card-body"><p className="category">{product.category || 'Uncategorized'}</p><h3>{product.name}</h3><p className="description">{product.description}</p><div className="card-footer"><div><strong>{formatPrice(product.price)}</strong><span> / {product.unit}</span></div>{product.stock_balance > 0 && selectedProducts[product.id] ? <div className="quantity-control" aria-label={`Quantity for ${product.name}`}><button onClick={() => updateQuantity(product, selectedProducts[product.id] - 1)} aria-label={`Decrease ${product.name}`}>−</button><span>{selectedProducts[product.id]}</span><button onClick={() => updateQuantity(product, selectedProducts[product.id] + 1)} disabled={selectedProducts[product.id] >= product.stock_balance} aria-label={`Increase ${product.name}`}>+</button></div> : <button className="add-button" onClick={() => updateQuantity(product, 1)} disabled={product.stock_balance <= 0}>{product.stock_balance > 0 ? '+ Add' : 'Sold out'}</button>}</div></div>
            </article>
          })}
        </div> : <div className="state-message">No products match these filters. Try a different search.</div>}
        {selectedItems.length > 0 && <aside className="sale-summary" aria-live="polite"><div className="sale-summary-title"><div><p className="eyebrow">CURRENT SALE</p><h2>{selectedCount} item{selectedCount === 1 ? '' : 's'} selected</h2></div><button className="clear-sale" onClick={() => setSelectedProducts({})}>Clear</button></div><div className="customer-details"><label className="customer-name"><span>Customer name</span><input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Enter customer name" autoComplete="name" /></label><label className="customer-name"><span>Mobile number</span><input type="tel" inputMode="tel" value={customerMobile} onChange={(event) => setCustomerMobile(event.target.value)} placeholder="Enter mobile number" autoComplete="tel" /></label></div><div className="selected-items">{selectedItems.map(({ product, quantity }) => <div className="selected-item" key={product.id}><div><strong>{product.name}</strong><span>{formatPrice(product.price)} × {quantity}</span></div><div className="quantity-control"><button onClick={() => updateQuantity(product, quantity - 1)} aria-label={`Decrease ${product.name}`}>−</button><span>{quantity}</span><button onClick={() => updateQuantity(product, quantity + 1)} disabled={quantity >= product.stock_balance} aria-label={`Increase ${product.name}`}>+</button></div><b>{formatPrice(product.price * quantity)}</b></div>)}</div><div className="sale-total"><span>Total</span><strong>{formatPrice(saleTotal)}</strong></div>{saleState.message && <p className={`sale-message ${saleState.type}`}>{saleState.message}</p>}<button className="submit-sale" onClick={submitSale} disabled={saleState.submitting}>{saleState.submitting ? 'Creating sale…' : 'Create sale →'}</button></aside>}
      </section>
      </div>
      </div>
    </main>
  )
}

export default Home
