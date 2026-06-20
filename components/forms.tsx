'use client';

import { useId } from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  hint?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  unit,
  hint,
}: NumberFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {unit ? <span className="text-slate-400"> ({unit})</span> : null}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        aria-describedby={hintId}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-600"
      />
      {hint ? (
        <p id={hintId} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

interface Option<T extends string> {
  value: T;
  label: string;
}

interface RadioGroupProps<T extends string> {
  legend: string;
  value: T;
  options: Option<T>[];
  onChange: (v: T) => void;
}

export function RadioGroup<T extends string>({
  legend,
  value,
  options,
  onChange,
}: RadioGroupProps<T>) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-700">{legend}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                selected
                  ? 'border-brand-600 bg-brand-50 font-semibold text-brand-700'
                  : 'border-slate-300 hover:border-brand-400'
              }`}
            >
              <input
                type="radio"
                name={legend}
                value={opt.value}
                checked={selected}
                onChange={() => onChange(opt.value)}
                className="accent-brand-600"
              />
              {opt.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
