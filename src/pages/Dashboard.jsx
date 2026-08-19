import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getDashboardDetails } from '../service/products'
import { getCurrentUser, hasAdminRole } from '../service/currentUser'
import '../styles/dashboard.css'

const numberValue = (value) => Number(value?.total ?? value?.amount ?? value?.sales ?? value ?? 0) || 0
const currency = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(numberValue(value))

const Dashboard = () => {
  const user = getCurrentUser()
  const isAdmin = hasAdminRole(user)
  const [data, setData] = useState({})
  const [state, setState] = useState({ loading: true, error: '' })

  const loadDashboard = async () => {
    setState({ loading: true, error: '' })
    try {
      const response = await getDashboardDetails()
      setData(response.data || {})
      setState({ loading: false, error: '' })
    } catch (error) {
      setData({})
      setState({ loading: false, error: error?.response?.data?.detail || 'Unable to load dashboard data.' })
    }
  }

  useEffect(() => {
    const request = window.setTimeout(loadDashboard, 0)
    return () => window.clearTimeout(request)
  }, [])

  const todaySales = data.one_day_sales ?? data.today_sales ?? data.daily_sales
  const monthlySales = data.monthly_sales ?? data.month_sales ?? data.monthly_total
  const profit = data.profit_percentage ?? data.profit_percent
  const loss = data.loss_percentage ?? data.loss_percent
  const popularProducts = data.most_selling_products ?? data.top_products ?? []
  const lowStockItems = data.low_stock_items ?? data.low_stock_products ?? []
  const monthSeries = useMemo(() => Array.isArray(monthlySales) ? monthlySales : [], [monthlySales])
  const maximumMonthSale = Math.max(...monthSeries.map((item) => numberValue(item)), 1)
  const monthlyTotal = monthSeries.length ? monthSeries.reduce((sum, item) => sum + numberValue(item), 0) : numberValue(monthlySales)

  return <main className="dashboard-page">
    <div className="dashboard-layout">
      <aside className="app-sidebar"><Link className="brand" to="/home"><span className="brand-mark">S</span><span>stockroom</span></Link><nav className="sidebar-nav" aria-label="Main navigation"><p>MENU</p><Link to="/home"><span>▦</span> Products</Link><Link className="active" to="/dashboard"><span>▤</span> Dashboard</Link>{isAdmin && <><p className="sidebar-section">ADMIN TOOLS</p><Link to="/add-product"><span>＋</span> Add product</Link></>}</nav></aside>
      <div className="dashboard-content"><header className="dashboard-header"><div><p className="eyebrow">{isAdmin ? 'ADMIN OVERVIEW' : 'STAFF OVERVIEW'}</p><h1>Business dashboard</h1><p>See the inventory and sales performance at a glance.</p></div><button onClick={loadDashboard} disabled={state.loading}>↻ {state.loading ? 'Loading' : 'Refresh'}</button></header>
        {state.error && <div className="dashboard-error">ⓘ {state.error}</div>}
        <section className="dashboard-stats"><article><span className="dash-icon mint">₹</span><div><small>Today’s sales</small><strong>{currency(todaySales)}</strong><em>{todaySales?.orders ?? todaySales?.count ?? 0} orders today</em></div></article><article><span className="dash-icon orange">◈</span><div><small>Monthly sales</small><strong>{currency(monthlyTotal)}</strong><em>This month’s total</em></div></article><article><span className="dash-icon yellow">◷</span><div><small>Low-stock items</small><strong>{Array.isArray(lowStockItems) ? lowStockItems.length : numberValue(lowStockItems)}</strong><em>Need attention</em></div></article>{isAdmin && <><article><span className="dash-icon blue">↗</span><div><small>Profit percentage</small><strong>{numberValue(profit)}%</strong><em>Current period</em></div></article><article><span className="dash-icon red">↘</span><div><small>Loss percentage</small><strong>{numberValue(loss)}%</strong><em>Current period</em></div></article></>}</section>
        <section className="dashboard-grid"><article className="dashboard-panel sales-chart"><div className="panel-heading"><div><p className="eyebrow">SALES OVERVIEW</p><h2>Monthly sales</h2></div><span>{currency(monthlyTotal)}</span></div>{state.loading ? <p className="panel-empty">Loading chart…</p> : monthSeries.length ? <div className="bar-chart">{monthSeries.map((item, index) => <div className="bar-column" key={item.month ?? item.label ?? index}><div className="bar-value" style={{ height: `${Math.max((numberValue(item) / maximumMonthSale) * 100, 4)}%` }} title={currency(item)} /><small>{item.month ?? item.label ?? `M${index + 1}`}</small></div>)}</div> : <p className="panel-empty">Monthly sales data will appear here.</p>}</article><article className="dashboard-panel"><div className="panel-heading"><div><p className="eyebrow">TOP PERFORMERS</p><h2>Most selling products</h2></div><span>Top {Array.isArray(popularProducts) ? popularProducts.length : 0}</span></div>{Array.isArray(popularProducts) && popularProducts.length ? <ol className="product-ranking">{popularProducts.slice(0, 5).map((item, index) => <li key={item.id ?? item.product_id ?? index}><b>{index + 1}</b><div><strong>{item.name ?? item.product_name ?? 'Product'}</strong><span>{item.quantity_sold ?? item.sold_quantity ?? item.count ?? 0} sold</span></div><em>{currency(item.revenue ?? item.total ?? item.sales)}</em></li>)}</ol> : <p className="panel-empty">No product sales data yet.</p>}</article><article className="dashboard-panel low-stock-panel"><div className="panel-heading"><div><p className="eyebrow">INVENTORY ALERTS</p><h2>Low-stock items</h2></div><span className="alert-count">{Array.isArray(lowStockItems) ? lowStockItems.length : 0}</span></div>{Array.isArray(lowStockItems) && lowStockItems.length ? <div className="stock-list">{lowStockItems.slice(0, 6).map((item, index) => <div key={item.id ?? index}><span>{item.name ?? item.product_name ?? 'Product'}</span><b>{item.stock_balance ?? item.stock ?? 0} left</b></div>)}</div> : <p className="panel-empty">No low-stock items.</p>}</article></section>
      </div>
    </div>
  </main>
}

export default Dashboard
