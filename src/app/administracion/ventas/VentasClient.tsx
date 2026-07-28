"use client";

import React, { useState, useEffect } from "react";
import { 
  getDashboardVentas, 
  getHistorialVentas, 
  getBajoStock, 
  getCategoriasProductos, 
  getProductos, 
  createCategoriaProducto, 
  createProducto, 
  updateStockProducto, 
  registrarVenta 
} from "@/lib/db/ventas";
import { getBrigadas } from "@/lib/db/brigadas";
import styles from "@/styles/pages/admin.module.css";

export function VentasClient({ userId }: { userId: string }) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "nueva_venta" | "inventario" | "historial">("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  // Data
  const [dashboard, setDashboard] = useState<any>(null);
  const [historial, setHistorial] = useState<any[]>([]);
  const [bajoStock, setBajoStock] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [productos, setProductos] = useState<any[]>([]);
  const [brigadas, setBrigadas] = useState<any[]>([]);

  // Modals state
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isProdModalOpen, setIsProdModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);

  // Forms state
  const [catForm, setCatForm] = useState({ codigo: "", nombre: "", descripcion: "" });
  const [prodForm, setProdForm] = useState({ categoria_id: "", codigo: "", nombre: "", descripcion: "", precio: 0, stock: 0 });
  const [stockForm, setStockForm] = useState({ id: "", nombre: "", stock: 0 });

  // Venta state (Cart)
  const [ventaBrigadaId, setVentaBrigadaId] = useState("");
  const [ventaObservaciones, setVentaObservaciones] = useState("");
  const [cart, setCart] = useState<Array<{ producto_id: string, nombre: string, cantidad: number, precio_unitario: number, maxStock: number }>>([]);
  const [isSubmittingVenta, setIsSubmittingVenta] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [dash, hist, bs, cats, prods, brigs] = await Promise.all([
        getDashboardVentas(),
        getHistorialVentas(),
        getBajoStock(),
        getCategoriasProductos(),
        getProductos(),
        getBrigadas()
      ]);
      setDashboard(dash);
      setHistorial(hist);
      setBajoStock(bs);
      setCategorias(cats);
      setProductos(prods);
      setBrigadas(brigs.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // -- Handlers Inventario --
  const submitCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategoriaProducto(catForm);
      setIsCatModalOpen(false);
      fetchData();
    } catch (e: any) { alert(e.message); }
  };

  const submitProducto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProducto(prodForm);
      setIsProdModalOpen(false);
      fetchData();
    } catch (e: any) { alert(e.message); }
  };

  const submitStock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateStockProducto(stockForm.id, stockForm.stock);
      setIsStockModalOpen(false);
      fetchData();
    } catch (e: any) { alert(e.message); }
  };

  // -- Handlers Carrito de Ventas --
  const addToCart = (productoId: string) => {
    const prod = productos.find(p => p.id === productoId);
    if (!prod || prod.stock <= 0) return;

    setCart(prev => {
      const exists = prev.find(item => item.producto_id === productoId);
      if (exists) {
        if (exists.cantidad >= prod.stock) {
          alert("No puedes vender más del stock disponible.");
          return prev;
        }
        return prev.map(item => item.producto_id === productoId ? { ...item, cantidad: item.cantidad + 1 } : item);
      }
      return [...prev, { producto_id: prod.id, nombre: prod.nombre, cantidad: 1, precio_unitario: prod.precio, maxStock: prod.stock }];
    });
  };

  const removeFromCart = (productoId: string) => {
    setCart(prev => prev.filter(item => item.producto_id !== productoId));
  };

  const updateCartQty = (productoId: string, qty: number) => {
    setCart(prev => prev.map(item => {
      if (item.producto_id === productoId) {
        if (qty > item.maxStock) {
          alert("Límite de stock excedido.");
          return item;
        }
        return { ...item, cantidad: qty > 0 ? qty : 1 };
      }
      return item;
    }));
  };

  const calcularTotalCarrito = () => cart.reduce((acc, item) => acc + (item.cantidad * item.precio_unitario), 0);

  const confirmarVenta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("El carrito está vacío");

    setIsSubmittingVenta(true);
    try {
      const res = await registrarVenta({
        vendedor_id: userId,
        brigada_id: ventaBrigadaId || undefined,
        observaciones: ventaObservaciones,
        detalles: cart
      });
      alert(`Venta registrada exitosamente. Código: ${res.codigo}`);
      setCart([]);
      setVentaBrigadaId("");
      setVentaObservaciones("");
      fetchData();
      setActiveTab("dashboard");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSubmittingVenta(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.4rem" }}>
      
      {/* Menu Pestañas */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", overflowX: "auto" }}>
        {["dashboard", "nueva_venta", "inventario", "historial"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            style={{
              padding: "0.8rem 1.6rem", borderRadius: "var(--radius-sm)", border: "none", cursor: "pointer", fontWeight: "bold",
              background: activeTab === tab ? "var(--primaryColor)" : "transparent",
              color: activeTab === tab ? "white" : "var(--gray)",
              textTransform: "capitalize"
            }}
          >
            {tab.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? <p>Cargando datos...</p> : (
        <>
          {/* TAB 1: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div>
              <div className={styles.statsGrid} style={{ marginBottom: "2.4rem" }}>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}><h3>Ventas Realizadas</h3></div>
                  <p className={styles.statValue}>{dashboard?.ventas || 0}</p>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}><h3>Ingresos Totales</h3></div>
                  <p className={styles.statValue} style={{ color: "var(--success)" }}>L. {Number(dashboard?.ingresos || 0).toFixed(2)}</p>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statHeader}><h3>Promedio por Venta</h3></div>
                  <p className={styles.statValue}>L. {Number(dashboard?.promedio_venta || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                  <h3> Productos con Bajo Stock (5 o menos)</h3>
                </div>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Stock Actual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bajoStock.length === 0 ? <tr><td colSpan={3} style={{textAlign: "center"}}>Inventario saludable.</td></tr> :
                     bajoStock.map(p => (
                       <tr key={p.id}>
                         <td>{p.codigo}</td>
                         <td style={{fontWeight: "bold"}}>{p.nombre}</td>
                         <td style={{fontWeight: "bold", color: p.stock === 0 ? "var(--danger)" : "var(--warning)"}}>{p.stock}</td>
                       </tr>
                     ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: NUEVA VENTA */}
          {activeTab === "nueva_venta" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2.4rem", alignItems: "start" }}>
              
              {/* Catalogo */}
              <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                  <h3>Catálogo de Productos</h3>
                </div>
                <div style={{ padding: "1.6rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1.6rem" }}>
                  {productos.filter(p => p.activo).map(p => (
                    <div key={p.id} style={{ 
                      border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.6rem",
                      display: "flex", flexDirection: "column", gap: "0.8rem", background: "var(--bg-secondary)"
                    }}>
                      <div style={{ fontSize: "1.2rem", color: "var(--gray)" }}>{p.codigo}</div>
                      <h4 style={{ margin: 0, fontSize: "1.6rem" }}>{p.nombre}</h4>
                      <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--success)" }}>L. {p.precio}</div>
                      <div style={{ fontSize: "1.2rem", color: p.stock > 0 ? "var(--primaryColor)" : "var(--danger)" }}>
                        Stock: {p.stock}
                      </div>
                      <button 
                        className={styles.btnPrimary} 
                        style={{ marginTop: "auto" }} 
                        onClick={() => addToCart(p.id)}
                        disabled={p.stock === 0}
                      >
                        {p.stock === 0 ? "Agotado" : "Añadir"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carrito */}
              <form className={styles.adminFormSingleColumn} style={{ background: "var(--white)", padding: "2.4rem", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-sm)", position: "sticky", top: "2.4rem" }} onSubmit={confirmarVenta}>
                <h3 style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", fontSize: "1.8rem", fontWeight: "700" }}>Resumen de Venta</h3>
                
                <div style={{ minHeight: "150px", marginBottom: "2rem" }}>
                  {cart.length === 0 ? <p style={{ color: "var(--gray)", textAlign: "center" }}>Carrito vacío</p> : 
                    cart.map((item, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", fontSize: "1.4rem" }}>
                        <div style={{ flex: 1 }}>
                          <strong>{item.nombre}</strong>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "0.4rem" }}>
                            <input 
                              type="number" min="1" max={item.maxStock} value={item.cantidad} 
                              onChange={(e) => updateCartQty(item.producto_id, Number(e.target.value))}
                              style={{ width: "60px", padding: "0.2rem" }}
                            />
                            <span>x L. {item.precio_unitario}</span>
                          </div>
                        </div>
                        <div style={{ fontWeight: "bold" }}>L. {(item.cantidad * item.precio_unitario).toFixed(2)}</div>
                        <button type="button" onClick={() => removeFromCart(item.producto_id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer", marginLeft: "1rem", fontWeight: "bold" }}>✕</button>
                      </div>
                    ))
                  }
                </div>

                <div style={{ borderTop: "2px solid var(--border-color)", paddingTop: "1.6rem", marginBottom: "2rem", display: "flex", justifyContent: "space-between", fontSize: "2rem", fontWeight: "bold" }}>
                  <span>TOTAL:</span>
                  <span style={{ color: "var(--success)" }}>L. {calcularTotalCarrito().toFixed(2)}</span>
                </div>

                <label className={styles.formField} style={{ marginBottom: "1.6rem" }}>
                  <span className={styles.fieldLabel}>Asociar a Brigada <span className={styles.optionalTag}>(Opcional)</span></span>
                  <select value={ventaBrigadaId} onChange={e => setVentaBrigadaId(e.target.value)}>
                    <option value="">-- Ninguna --</option>
                    {brigadas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                  </select>
                </label>

                <label className={styles.formField} style={{ marginBottom: "2rem" }}>
                  <span className={styles.fieldLabel}>Observaciones <span className={styles.optionalTag}>(Opcional)</span></span>
                  <textarea rows={2} value={ventaObservaciones} onChange={e => setVentaObservaciones(e.target.value)} placeholder="Ej. Cliente pagó exacto..." />
                </label>

                <button type="submit" className={styles.btnPrimary} style={{ width: "100%", padding: "1.2rem", fontSize: "1.6rem" }} disabled={cart.length === 0 || isSubmittingVenta}>
                  {isSubmittingVenta ? "Procesando..." : "Confirmar Venta"}
                </button>
              </form>

            </div>
          )}

          {/* TAB 3: INVENTARIO (Categorías y Productos) */}
          {activeTab === "inventario" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.4rem" }}>
              <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                  <h3>Categorías</h3>
                  <button className={styles.btnSecondary} onClick={() => { setCatForm({codigo: "", nombre: "", descripcion: ""}); setIsCatModalOpen(true); }}>+ Nueva Categoría</button>
                </div>
                <table className={styles.adminTable}>
                  <thead><tr><th>Código</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {categorias.map(c => (
                      <tr key={c.id}>
                        <td>{c.codigo}</td>
                        <td style={{fontWeight: "bold"}}>{c.nombre}</td>
                        <td>{c.descripcion}</td>
                        <td>
                          <button 
                            className={styles.btnSecondary} 
                            style={{ color: "var(--danger)", border: "none", padding: "0.4rem 0.8rem" }}
                            onClick={async () => {
                              if(confirm("¿Seguro que deseas eliminar esta categoría? (No debe tener productos asociados)")) {
                                try {
                                  const { deleteCategoriaProducto } = await import("@/lib/db/ventas");
                                  await deleteCategoriaProducto(c.id);
                                  fetchData();
                                } catch (e: any) { alert("Error al eliminar: " + e.message); }
                              }
                            }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className={styles.tableContainer}>
                <div className={styles.tableHeader}>
                  <h3>Productos</h3>
                  <button className={styles.btnPrimary} onClick={() => { setProdForm({categoria_id: "", codigo: "", nombre: "", descripcion: "", precio: 0, stock: 0}); setIsProdModalOpen(true); }}>+ Nuevo Producto</button>
                </div>
                <table className={styles.adminTable}>
                  <thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th></tr></thead>
                  <tbody>
                    {productos.map(p => (
                      <tr key={p.id}>
                        <td>{p.codigo}</td>
                        <td style={{fontWeight: "bold"}}>{p.nombre}</td>
                        <td>{p.categorias_productos?.nombre}</td>
                        <td>L. {p.precio}</td>
                        <td style={{fontWeight: "bold", color: p.stock === 0 ? "var(--danger)" : "inherit"}}>{p.stock}</td>
                        <td style={{ display: "flex", gap: "0.5rem" }}>
                          <button className={styles.btnSecondary} onClick={() => { setStockForm({id: p.id, nombre: p.nombre, stock: p.stock}); setIsStockModalOpen(true); }}>Ajustar Stock</button>
                          <button 
                            className={styles.btnSecondary} 
                            style={{ color: "var(--danger)", border: "none" }}
                            onClick={async () => {
                              if(confirm("¿Seguro que deseas eliminar este producto? (No debe tener ventas asociadas)")) {
                                try {
                                  const { deleteProducto } = await import("@/lib/db/ventas");
                                  await deleteProducto(p.id);
                                  fetchData();
                                } catch (e: any) { alert("Error al eliminar: " + e.message); }
                              }
                            }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: HISTORIAL DE VENTAS */}
          {activeTab === "historial" && (
            <div className={styles.tableContainer}>
              <div className={styles.tableHeader}><h3>Historial de Ventas</h3></div>
              <table className={styles.adminTable}>
                <thead><tr><th>Fecha</th><th>Código</th><th>Vendedor</th><th>Total</th></tr></thead>
                <tbody>
                  {historial.length === 0 ? <tr><td colSpan={4} style={{textAlign: "center"}}>No hay ventas registradas.</td></tr> : 
                    historial.map(v => (
                      <tr key={v.id}>
                        <td>{new Date(v.fecha).toLocaleString()}</td>
                        <td style={{fontWeight: "bold"}}>{v.codigo}</td>
                        <td>{v.vendedor}</td>
                        <td style={{fontWeight: "bold", fontSize: "1.4rem", color: "var(--success)"}}>L. {Number(v.total).toFixed(2)}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* MODAL CATEGORIA */}
      {isCatModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsCatModalOpen(false)}>
          <div className={`${styles.modal} ${styles.modalSm}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "700" }}>Nueva Categoría de Producto</h3>
              <button className={styles.modalClose} onClick={() => setIsCatModalOpen(false)}>✕</button>
            </div>
            <form className={styles.adminFormSingleColumn} onSubmit={submitCategoria} style={{ padding: "2.4rem" }}>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Código de Categoría <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                <input value={catForm.codigo} onChange={e => setCatForm({...catForm, codigo: e.target.value.toUpperCase()})} placeholder="Ej. CAM" required maxLength={15} />
              </label>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Nombre de Categoría <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                <input value={catForm.nombre} onChange={e => setCatForm({...catForm, nombre: e.target.value})} placeholder="Ej. Camisetas" required />
              </label>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Descripción <span className={styles.optionalTag}>(Opcional)</span></span>
                <textarea rows={2} value={catForm.descripcion} onChange={e => setCatForm({...catForm, descripcion: e.target.value})} />
              </label>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setIsCatModalOpen(false)}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary}>Guardar Categoría</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRODUCTO */}
      {isProdModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsProdModalOpen(false)}>
          <div className={`${styles.modal} ${styles.modalSm}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "700" }}>Nuevo Producto de Recaudación</h3>
              <button className={styles.modalClose} onClick={() => setIsProdModalOpen(false)}>✕</button>
            </div>
            <form className={styles.adminFormSingleColumn} onSubmit={submitProducto} style={{ padding: "2.4rem" }}>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Categoría <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                <select value={prodForm.categoria_id} onChange={e => setProdForm({...prodForm, categoria_id: e.target.value})} required>
                  <option value="">-- Seleccionar --</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
              </label>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Código Identificador <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                <input value={prodForm.codigo} onChange={e => setProdForm({...prodForm, codigo: e.target.value.toUpperCase()})} placeholder="Ej. CAM-001" required />
              </label>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Nombre del Producto <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                <input value={prodForm.nombre} onChange={e => setProdForm({...prodForm, nombre: e.target.value})} placeholder="Ej. Camiseta Oficial Blanca" required />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.2rem" }}>
                <label className={styles.formField}>
                  <span className={styles.fieldLabel}>Precio (L.) <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                  <input type="number" step="0.01" min="0" value={prodForm.precio} onChange={e => setProdForm({...prodForm, precio: Number(e.target.value)})} required />
                </label>
                <label className={styles.formField}>
                  <span className={styles.fieldLabel}>Stock Inicial <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                  <input type="number" min="0" value={prodForm.stock} onChange={e => setProdForm({...prodForm, stock: Number(e.target.value)})} required />
                </label>
              </div>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Descripción <span className={styles.optionalTag}>(Opcional)</span></span>
                <textarea rows={2} value={prodForm.descripcion} onChange={e => setProdForm({...prodForm, descripcion: e.target.value})} />
              </label>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setIsProdModalOpen(false)}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary}>Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJUSTAR STOCK */}
      {isStockModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsStockModalOpen(false)}>
          <div className={`${styles.modal} ${styles.modalSm}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ fontSize: "1.8rem", fontWeight: "700" }}>Ajustar Stock Físico</h3>
              <button className={styles.modalClose} onClick={() => setIsStockModalOpen(false)}>✕</button>
            </div>
            <form className={styles.adminFormSingleColumn} onSubmit={submitStock} style={{ padding: "2.4rem" }}>
              <p style={{ marginBottom: "1.6rem", fontSize: "1.4rem", color: "var(--text-muted)" }}>
                Actualizando existencias para: <strong>{stockForm.nombre}</strong>
              </p>
              <label className={styles.formField}>
                <span className={styles.fieldLabel}>Nuevo Nivel de Stock <strong className={styles.requiredStar}>* (Requerido)</strong></span>
                <input type="number" min="0" value={stockForm.stock} onChange={e => setStockForm({...stockForm, stock: Number(e.target.value)})} required />
              </label>
              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={() => setIsStockModalOpen(false)}>Cancelar</button>
                <button type="submit" className={styles.btnPrimary}>Actualizar Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

