
import { useState } from 'react';

export default function POSView({
  categorias, categoriaActiva, setCategoriaActiva,
  productos, agregarAlCarrito,
  carrito, seleccionado, setSeleccionado,
  cobrar, eliminarSeleccionado, limpiarCarrito,
}) {
  const [busqueda, setBusqueda] = useState('');
  const totalCarrito = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  const productosFiltrados = busqueda.trim()
    ? productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    : [];

  const limpiarBusqueda = () => setBusqueda('');

  return (
    <div className="container">
      <div className="productos">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <h2 style={{ margin: 0 }}>Productos</h2>
          <div style={{ position: 'relative', flex: 1, maxWidth: '320px', marginLeft: 'auto' }}>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar producto..."
              style={{
                width: '100%', padding: '8px 36px 8px 12px', border: '2px solid #cbd5e0',
                borderRadius: '8px', fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                borderColor: busqueda ? '#667eea' : '#cbd5e0',
              }}
            />
            {busqueda && (
              <button onClick={limpiarBusqueda} style={{
                position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#a0aec0', padding: 0,
              }}>✕</button>
            )}
          </div>
        </div>

        {busqueda.trim() ? (
          <div>
            {productosFiltrados.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#a0aec0', fontSize: '14px' }}>
                Sin resultados para "{busqueda}"
              </div>
            ) : (
              <div className="productos-grid">
                {productosFiltrados.map(producto => (
                  <button key={producto.id} className="producto-btn" onClick={() => { agregarAlCarrito(producto); limpiarBusqueda(); }}>
                    <div>{producto.nombre}</div>
                    <div style={{ fontSize: '10px', color: '#a0aec0' }}>{producto.categoria}</div>
                    <div className="precio">${producto.precio}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : categoriaActiva === null ? (
          <div className="categorias-menu">
            {categorias.map(cat => (
              <button
                key={cat}
                className={`categoria-btn
                  ${cat === 'TORTAS' ? 'torta-hero' : ''}
                  ${cat === 'TENTACIONES' ? 'tentacion-hero' : ''}
                  ${cat === 'PALITOS' ? 'palitos-hero' : ''}
                  ${cat === 'PIZZAS' ? 'pizzas-hero' : ''}
                  ${cat === 'FAMILIARES' ? 'familiar-hero' : ''}
                  ${cat === 'CUCURUCHOS' ? 'cucuruchos-hero' : ''}
                  ${cat === 'POSTRES' ? 'bombones-hero' : ''}
                  ${cat === 'GRANEL' ? 'granel-hero' : ''}
                  ${cat === 'BEBIDAS' ? 'bebidas-hero' : ''}
                  ${cat === 'BATIDOS' ? 'batidos-hero' : ''}
                  ${cat === 'SIN TACC' ? 'sintacc-hero' : ''}
                  ${cat === 'CHOCOLATES' ? 'chocolates-hero' : ''}`}
                aria-label={cat}
                onClick={() => setCategoriaActiva(cat)}
              >
                {!['TORTAS', 'TENTACIONES', 'PALITOS', 'PIZZAS', 'FAMILIARES', 'CUCURUCHOS', 'POSTRES', 'GRANEL', 'BEBIDAS', 'BATIDOS', 'SIN TACC', 'CHOCOLATES'].includes(cat) && cat}
              </button>
            ))}
          </div>
        ) : (
          <>
            <button className="btn-volver" onClick={() => setCategoriaActiva(null)}>← VOLVER A CATEGORÍAS</button>
            <h3>{categoriaActiva}</h3>
            {categoriaActiva === 'PALITOS' ? (() => {
              const palitos = productos.filter(p => p.categoria === 'PALITOS');
              const bases = Array.from(new Set(palitos.map(p => p.nombre.replace(/\s+x\s*\d+$/, ''))));
              return (
                <div className="palitos-rows">
                  {bases.map(base => {
                    const opciones = palitos.filter(p => p.nombre.startsWith(base));
                    return (
                      <div key={base} className="palitos-row">
                        {opciones.map(producto => (
                          <button key={producto.id} className="producto-btn" onClick={() => agregarAlCarrito(producto)}>
                            <div>{producto.nombre}</div>
                            <div className="precio">${producto.precio}</div>
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })() : (
              <div className="productos-grid">
                {productos.filter(p => p.categoria === categoriaActiva).map(producto => (
                  <button key={producto.id} className="producto-btn" onClick={() => agregarAlCarrito(producto)}>
                    <div>{producto.nombre}</div>
                    <div className="precio">${producto.precio}</div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <div className="carrito">
        <h2>Carrito</h2>
        {carrito.length === 0 ? <p className="carrito-vacio">El carrito está vacío</p> : (
          <>
            <div className="carrito-items">
              {carrito.map(item => (
                <div
                  key={item.id}
                  className={`carrito-item ${seleccionado === item.id ? 'seleccionado' : ''}`}
                  onClick={() => setSeleccionado(item.id)}
                >
                  <span>{item.nombre}</span>
                  <span>{item.cantidad}</span>
                  <span className="item-total">${item.precio * item.cantidad}</span>
                </div>
              ))}
            </div>
            <div className="total"><h3>TOTAL: ${totalCarrito}</h3></div>
            <div className="botones">
              <button className="btn-cobrar" onClick={cobrar}>COBRAR</button>
              <button className="btn-borrar" onClick={eliminarSeleccionado} disabled={seleccionado === null}>BORRAR</button>
              <button className="btn-limpiar" onClick={limpiarCarrito}>LIMPIAR TODO</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
