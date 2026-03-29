export interface Supplier {
  id: number
  name: string
  contact_person: string | null
  phone: string | null
  email: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Material {
  id: number
  code: string
  name: string
  category: string | null
  unit: string
  specification: string | null
  supplier_id: number | null
  quantity: string
  min_stock: string
  max_stock: string | null
  unit_price: string
  status: string
  created_at: string
  updated_at: string
}

export interface StockMovement {
  id: number
  material_id: number
  movement_type: 'IN' | 'OUT' | 'ADJUST'
  quantity: string
  unit_price: string
  reference_no: string | null
  remark: string | null
  operator_id: number | null
  created_at: string
}

export interface Alert {
  id: number
  material_id: number
  alert_type: 'LOW_STOCK' | 'OVER_STOCK'
  message: string
  is_resolved: boolean
  created_at: string
  resolved_at: string | null
}

export interface Stocktaking {
  id: number
  period: string
  status: 'draft' | 'confirmed'
  operator_id: number | null
  remark: string | null
  created_at: string
  updated_at: string
}

export interface StocktakingItem {
  id: number
  stocktaking_id: number
  material_id: number
  book_quantity: string
  actual_quantity: string
  difference: string | null
  created_at: string
}

export interface User {
  id: number
  username: string
  role: 'admin' | 'staff'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface MonthlyReportRow {
  material_id: number
  movement_type: string
  total_quantity: string
  total_amount: string
}

export interface CreateSupplierInput {
  name: string
  contact_person?: string
  phone?: string
  email?: string
  address?: string
}

export interface CreateMaterialInput {
  code: string
  name: string
  category?: string
  unit: string
  specification?: string
  supplier_id?: number
  quantity: string
  min_stock: string
  max_stock?: string
  unit_price: string
}

export interface CreateMovementInput {
  material_id: number
  movement_type: 'IN' | 'OUT' | 'ADJUST'
  quantity: string
  unit_price: string
  reference_no?: string
  remark?: string
}

export interface CreateStocktakingInput {
  period: string
  remark?: string
}

export interface AddStocktakingItemInput {
  material_id: number
  book_quantity: string
  actual_quantity: string
}

export interface CreateUserInput {
  username: string
  password: string
}

export interface UpdatePasswordInput {
  new_password: string
}
