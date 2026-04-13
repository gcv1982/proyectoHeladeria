
import React from 'react';

export default function POSView({
  categorias, categoriaActiva, setCategoriaActiva,
  productos, agregarAlCarrito,
  carrito, seleccionado, setSeleccionado,
  cobrar, eliminarSeleccionado, limpiarCarrito,
}) {
  const totalCarrito = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);

  return (
    <div className="container">
      <div className="productos">
        <h2>Productos</h2>
        {categoriaActiva === null ? (
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
            <div className="productos-grid">
              {categoriaActiva === 'PALITOS' ? (() => {
                const palitos = productos.filter(p => p.categoria === 'PALITOS');
                const bases = Array.from(new Set(palitos.map(p => p.nombre.replace(/\s+x\d+$/, ''))));
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
              })() : productos.filter(p => p.categoria === categoriaActiva).map(producto => (
                <button key={producto.id} className="producto-btn" onClick={() => agregarAlCarrito(producto)}>
                  <div>{producto.nombre}</div>
                  <div className="precio">${producto.precio}</div>
                </button>
              ))}
            </div>
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
