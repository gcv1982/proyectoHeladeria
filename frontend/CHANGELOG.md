# Changelog

## Unreleased

- Fix: Corregido el cálculo del total del carrito. Se centralizó la función de cálculo (`calcularTotal`) y se cambiaron las actualizaciones del estado del carrito a actualizadores funcionales para evitar problemas de estado stale. Se agregaron pruebas unitarias que verifican la suma, la adición de cantidades y la eliminación.
