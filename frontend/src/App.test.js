import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

test('renders app heading', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /grido laspiur/i });
  expect(heading).toBeInTheDocument();
});

test('muestra la nueva categoría FAMILIARES', () => {
  render(<App />);
  const cat = screen.getByRole('button', { name: /FAMILIARES/i });
  expect(cat).toBeInTheDocument();
});

test('muestra la nueva categoría TENTACIONES', () => {
  render(<App />);
  const cat = screen.getByRole('button', { name: /TENTACIONES/i });
  expect(cat).toBeInTheDocument();
});

test('muestra productos de la categoría TENTACIONES', async () => {
  render(<App />);
  const cat = screen.getByRole('button', { name: /TENTACIONES/i });
  await (await import('@testing-library/user-event')).default.click(cat);

  expect(await screen.findByText(/Chocolate/i)).toBeInTheDocument();
  expect(await screen.findByText(/Menta Granizado/i)).toBeInTheDocument();
  expect(await screen.findByText(/^Granizado$/i)).toBeInTheDocument();
  expect(await screen.findByText(/^Dulce de Leche$/i)).toBeInTheDocument();
  expect(await screen.findByText(/^Dulce de Leche Granizado$/i)).toBeInTheDocument();
  expect(await screen.findByText(/Lim[oó]n/i)).toBeInTheDocument();
  expect(await screen.findByText(/Crema Americana/i)).toBeInTheDocument();
  expect(await screen.findByText(/Frutilla/i)).toBeInTheDocument();
  expect(await screen.findByText(/Vainilla/i)).toBeInTheDocument();
  expect(await screen.findByText(/Crema Cookie/i)).toBeInTheDocument();
});

test('el botón de TORTAS usa la clase hero y tiene aria-label', () => {
  render(<App />);
  const tortas = screen.getByRole('button', { name: /TORTAS/i });
  expect(tortas).toHaveClass('torta-hero');
  expect(tortas).toHaveAttribute('aria-label', 'TORTAS');
});

test('productos de TENTACIONES están en orden alfabético', async () => {
  render(<App />);
  const userEvent = (await import('@testing-library/user-event')).default;
  const cat = screen.getByRole('button', { name: /TENTACIONES/i });
  await userEvent.click(cat);

  const grid = document.querySelector('.productos-grid');
  const names = Array.from(grid.querySelectorAll('.producto-btn div:first-child')).map(el => el.textContent.trim());
  const expected = ['Chocolate','Crema Americana','Crema Cookie','Dulce de Leche','Dulce de Leche Granizado','Frutilla','Granizado','Limón','Menta Granizado','Vainilla'];
  expect(names).toEqual(expected);
});

test('muestra productos de la categoría FAMILIARES', async () => {
  render(<App />);
  const cat = screen.getByRole('button', { name: /FAMILIARES/i });
  await userEvent.click(cat);

  expect(await screen.findByText(/Familiar nro 1/i)).toBeInTheDocument();
  expect(await screen.findByText(/Familiar nro 2/i)).toBeInTheDocument();
  expect(await screen.findByText(/Familiar nro 3/i)).toBeInTheDocument();
  expect(await screen.findByText(/Familiar nro 4/i)).toBeInTheDocument();
});

test('muestra la nueva categoría CUCURUCHOS', () => {
  render(<App />);
  const cat = screen.getByRole('button', { name: /CUCURUCHOS/i });
  expect(cat).toBeInTheDocument();
});

test('muestra productos de la categoría CUCURUCHOS', async () => {
  render(<App />);
  const userEvent = (await import('@testing-library/user-event')).default;
  const cat = screen.getByRole('button', { name: /CUCURUCHOS/i });
  await userEvent.click(cat);

  expect(await screen.findByText(/^1 Bocha$/i)).toBeInTheDocument();
  expect(await screen.findByText(/^2 Bochas$/i)).toBeInTheDocument();
  expect(await screen.findByText(/^3 Bochas$/i)).toBeInTheDocument();
  expect(await screen.findByText(/^GRIDO 2 Bochas$/i)).toBeInTheDocument();
  expect(await screen.findByText(/^GRIDO 3 Bochas$/i)).toBeInTheDocument();
  expect(await screen.findByText(/^Super Gridito$/i)).toBeInTheDocument();
});

test('Super Gridito no aparece en GRANEL', async () => {
  render(<App />);
  const userEvent = (await import('@testing-library/user-event')).default;
  const cat = screen.getByRole('button', { name: /GRANEL/i });
  await userEvent.click(cat);

  expect(screen.queryByText(/^Super Gridito$/i)).not.toBeInTheDocument();
});

test('Baño de Chocolate aparece en EXTRAS', async () => {
  render(<App />);
  const userEvent = (await import('@testing-library/user-event')).default;
  const cat = screen.getByRole('button', { name: /EXTRAS/i });
  await userEvent.click(cat);

  expect(await screen.findByText(/^Baño de Chocolate$/i)).toBeInTheDocument();
});

test('Baño de Chocolate no aparece en GRANEL', async () => {
  render(<App />);
  const userEvent = (await import('@testing-library/user-event')).default;
  const cat = screen.getByRole('button', { name: /GRANEL/i });
  await userEvent.click(cat);

  expect(screen.queryByText(/^Baño de Chocolate$/i)).not.toBeInTheDocument();
});

test('organiza PALITOS en tres filas con tres opciones cada una', async () => {
  render(<App />);
  const userEvent = (await import('@testing-library/user-event')).default;
  const cat = screen.getByRole('button', { name: /PALITOS/i });
  await userEvent.click(cat);

  // Esperar que las filas existan
  const rows = document.querySelectorAll('.palitos-row');
  expect(rows.length).toBe(3);

  // Verificar que cada fila tenga 3 botones y contenga las opciones esperadas
  const expected = [
    ['Palito Bombón x1', 'Palito Bombón x10', 'Palito Bombón x20'],
    ['Palito Cremoso x1', 'Palito Cremoso x10', 'Palito Cremoso x20'],
    ['Palito Frutal x1', 'Palito Frutal x10', 'Palito Frutal x20'],
  ];

  expected.forEach((names, idx) => {
    const buttons = Array.from(rows[idx].querySelectorAll('.producto-btn div:first-child')).map(el => el.textContent.trim());
    expect(buttons).toEqual(names);
  });
});
