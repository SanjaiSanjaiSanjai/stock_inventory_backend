import { API_BASE_URL } from './axiosClient'

const PRODUCTS_ENDPOINT = import.meta.env.VITE_PRODUCTS_ENDPOINT || '/home/products'

export const getAvailableProducts = () => API_BASE_URL.get(`${PRODUCTS_ENDPOINT}`, {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
  },
})

// Change VITE_SALES_ENDPOINT if your backend uses a different sales route.
const SALES_ENDPOINT = import.meta.env.VITE_SALES_ENDPOINT || '/sales'

export const createSale = (items, customerName, customerMobile) => API_BASE_URL.post(SALES_ENDPOINT, {
  customer_name: customerName,
  customer_mobile: customerMobile,
  items: items.map(({ product, quantity }) => ({
    product_id: product.id,
    quantity,
  })),
})

const CREATE_PRODUCT_ENDPOINT = '/add-product'

export const createProduct = (product, image) => {
  const formData = new FormData()
  formData.append('name', product.name)
  formData.append('category', product.category)
  formData.append('price', product.price)
  formData.append('unit', product.unit)
  formData.append('stock', product.stock)
  formData.append('description', product.description)
  formData.append('isAvailable', product.isAvailable ? 'true' : 'false')
  formData.append('image', image, image.name)

  // Override the shared JSON header. Axios/browser will add the multipart
  // boundary, so the File is transmitted as a real uploaded file.
  return API_BASE_URL.post(CREATE_PRODUCT_ENDPOINT, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

const DASHBOARD_ENDPOINT = import.meta.env.VITE_DASHBOARD_ENDPOINT || '/dashboard'

export const getDashboardDetails = () => API_BASE_URL.get(DASHBOARD_ENDPOINT)
