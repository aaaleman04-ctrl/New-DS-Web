import { supabase } from "../supabase";

// Categorías
export async function getCategoriasProductos() {
  const { data, error } = await supabase
    .from("categorias_productos")
    .select("*")
    .order("nombre", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createCategoriaProducto(categoria: any) {
  const { data, error } = await supabase
    .from("categorias_productos")
    .insert([categoria])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteCategoriaProducto(id: string) {
  const { error } = await supabase
    .from("categorias_productos")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// Productos
export async function getProductos() {
  const { data, error } = await supabase
    .from("productos")
    .select(`
      id, codigo, nombre, descripcion, precio, stock, activo,
      categorias_productos (nombre)
    `)
    .order("nombre", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function createProducto(producto: any) {
  const { data, error } = await supabase
    .from("productos")
    .insert([producto])
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateStockProducto(id: string, nuevoStock: number) {
  if (nuevoStock < 0) throw new Error("El stock no puede ser negativo");
  const { data, error } = await supabase
    .from("productos")
    .update({ stock: nuevoStock })
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteProducto(id: string) {
  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// Ventas Dashboard e Historial
export async function getDashboardVentas() {
  const { data, error } = await supabase
    .from("dashboard_ventas")
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getHistorialVentas() {
  const { data, error } = await supabase
    .from("v_ventas")
    .select("*")
    .order("fecha", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getBajoStock() {
  const { data, error } = await supabase
    .from("productos")
    .select("id, codigo, nombre, stock")
    .lte("stock", 5)
    .eq("activo", true)
    .order("stock", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

// Crear Venta y Detalles
export async function registrarVenta(ventaParams: { 
  vendedor_id: string, 
  brigada_id?: string, 
  observaciones?: string, 
  detalles: Array<{ producto_id: string, cantidad: number, precio_unitario: number }> 
}) {
  
  if (!ventaParams.detalles || ventaParams.detalles.length === 0) {
    throw new Error("La venta debe tener al menos un producto.");
  }

  // Generate code e.g., VTA-XXXX-XXXX
  const codigo = `VTA-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`;

  // 1. Insert Venta header
  const { data: venta, error: errVenta } = await supabase
    .from("ventas")
    .insert([{
      codigo,
      vendedor_id: ventaParams.vendedor_id,
      brigada_id: ventaParams.brigada_id || null,
      observaciones: ventaParams.observaciones || ""
    }])
    .select("id")
    .single();

  if (errVenta) throw new Error(`Error creando la venta: ${errVenta.message}`);

  // 2. Prepare detalles array
  const detallesInsert = ventaParams.detalles.map(d => ({
    venta_id: venta.id,
    producto_id: d.producto_id,
    cantidad: d.cantidad,
    precio_unitario: d.precio_unitario,
    subtotal: d.cantidad * d.precio_unitario
  }));

  // 3. Insert detalles (this will trigger Triggers for updating total and stock)
  const { error: errDetalles } = await supabase
    .from("detalle_ventas")
    .insert(detallesInsert);

  if (errDetalles) {
    // If it fails, ideally we'd want a transaction, but via REST we just delete the header to rollback manually
    await supabase.from("ventas").delete().eq("id", venta.id);
    throw new Error(`Error guardando detalles de venta: ${errDetalles.message}`);
  }

  return { success: true, venta_id: venta.id, codigo };
}
