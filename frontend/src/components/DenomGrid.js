
import React, { useState, useEffect, useImperativeHandle } from 'react';

const DENOM_CONFIG = [
  { key: 'd20000', label: '💵 $20.000', mult: 20000 },
  { key: 'd10000', label: '💵 $10.000', mult: 10000 },
  { key: 'd2000',  label: '💵 $2.000',  mult: 2000  },
  { key: 'd1000',  label: '💵 $1.000',  mult: 1000  },
  { key: 'd500',   label: '💵 $500',    mult: 500   },
  { key: 'd200',   label: '💵 $200',    mult: 200   },
  { key: 'd100',   label: '💵 $100',    mult: 100   },
  { key: 'd50',    label: '🪙 $50',     mult: 50    },
  { key: 'd20',    label: '🪙 $20',     mult: 20    },
  { key: 'd10',    label: '🪙 $10',     mult: 10    },
];

const DENOM_INIT = { d20000:'', d10000:'', d2000:'', d1000:'', d500:'', d200:'', d100:'', d50:'', d20:'', d10:'' };

export const calcDenomTotal = (v) =>
  DENOM_CONFIG.reduce((s, { key, mult }) => s + (Number(v[key]) || 0) * mult, 0);

function DenomGrid({ prefix, gridClass, totalLabel, onTotalChange, storageKey, ref }) {
  const [vals, setVals] = useState(() => {
    if (storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) return { ...DENOM_INIT, ...JSON.parse(saved) };
      } catch (e) { /* ignorar */ }
    }
    return DENOM_INIT;
  });

  const total = calcDenomTotal(vals);

  useImperativeHandle(ref, () => ({
    getTotal:  () => calcDenomTotal(vals),
    getValues: () => ({ ...vals }),
  }), [vals]);

  // Notificar al padre el total inicial (al montar, por si viene de localStorage)
  useEffect(() => { if (onTotalChange) onTotalChange(total); }, []); // eslint-disable-line

  const handleChange = (key) => (e) => {
    const raw = e.target.value;
    const v = raw === '' ? '' : String(Math.max(0, parseInt(raw, 10) || 0));
    const newVals = { ...vals, [key]: v };
    if (storageKey) {
      try { localStorage.setItem(storageKey, JSON.stringify(newVals)); } catch (_) {}
    }
    setVals(newVals);
    if (onTotalChange) onTotalChange(calcDenomTotal(newVals));
  };

  return (
    <>
      <div className={gridClass}>
        {DENOM_CONFIG.map(({ key, label, mult }) => (
          <div key={key} className="denominacion-item">
            <label htmlFor={`${prefix}-${key}`}>{label}</label>
            <input
              id={`${prefix}-${key}`}
              name={`${prefix}-${key}`}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="off"
              value={vals[key]}
              onChange={handleChange(key)}
              placeholder="0"
            />
            <span className="subtotal">${((Number(vals[key]) || 0) * mult).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <div
        className="total-inicio"
        style={gridClass === 'denominaciones-grid-cierre' ? { marginTop: '8px', padding: '6px 12px' } : {}}
      >
        <span className="total-label">{totalLabel}:</span><span className="total-monto">${total.toLocaleString()}</span>
      </div>
    </>
  );
}

export default DenomGrid;
