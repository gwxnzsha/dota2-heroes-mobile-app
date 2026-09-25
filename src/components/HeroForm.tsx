import React from 'react';
import { ATTRIBUTES } from '../data/attributes';
import type { HeroInput } from '../api/heroes';

interface Props {
  value: HeroInput;
  onChange: (next: HeroInput) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitLabel: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.1em] text-faint">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  'h-11 w-full rounded-card border border-line bg-ink-800 px-3.5 text-[14px] text-white placeholder:text-faint focus:border-line-strong focus:outline-none';

export function HeroForm({ value, onChange, onSubmit, submitting, submitLabel }: Props) {
  const set = <K extends keyof HeroInput>(key: K, v: HeroInput[K]) => onChange({ ...value, [key]: v });
  const num = (v: string) => (v === '' ? 0 : Number(v));

  const statFields: Array<[keyof HeroInput, string]> = [
    ['health', 'Health'], ['mana', 'Mana'], ['armor', 'Armor'],
    ['damageMin', 'Damage Min'], ['damageMax', 'Damage Max'],
    ['attackRange', 'Attack Range'], ['attackRate', 'Attack Rate'],
    ['moveSpeed', 'Move Speed'], ['turnRate', 'Turn Rate'],
    ['visionDay', 'Vision Day'], ['visionNight', 'Vision Night'],
    ['strBase', 'Str Base'], ['strGain', 'Str Gain'],
    ['agiBase', 'Agi Base'], ['agiGain', 'Agi Gain'],
    ['intBase', 'Int Base'], ['intGain', 'Int Gain'],
  ];

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="space-y-6 px-5 pb-10"
    >
      <Field label="Name">
        <input className={inputClass} value={value.name} onChange={(e) => set('name', e.target.value)} required />
      </Field>

      <Field label="Attribute">
        <div className="flex gap-2">
          {ATTRIBUTES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => set('attribute', a.id)}
              className={`h-10 flex-1 rounded-full border text-[12px] font-semibold uppercase tracking-[0.08em] ${
                value.attribute === a.id ? 'border-accent/45 bg-accent-dim text-white' : 'border-line bg-ink-800 text-muted'
              }`}
            >
              {a.short}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Attack Type">
        <div className="flex gap-2">
          {(['melee', 'ranged'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('attackType', t)}
              className={`h-10 flex-1 rounded-full border text-[12px] font-semibold uppercase tracking-[0.08em] ${
                value.attackType === t ? 'border-accent/45 bg-accent-dim text-white' : 'border-line bg-ink-800 text-muted'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Roles (comma-separated)">
        <input
          className={inputClass}
          value={value.roles.join(', ')}
          onChange={(e) => set('roles', e.target.value.split(',').map((r) => r.trim()).filter(Boolean))}
          placeholder="Support, Carry, Durable"
        />
      </Field>

      <Field label="Image URL">
        <input className={inputClass} value={value.imageUrl} onChange={(e) => set('imageUrl', e.target.value)} />
      </Field>

      <Field label="Description / Lore">
        <textarea
          className={`${inputClass} h-28 resize-none py-3`}
          value={value.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </Field>

      <div>
        <span className="mb-2 block text-[13px] font-semibold uppercase tracking-[0.1em] text-white">Statistics</span>
        <div className="grid grid-cols-2 gap-2.5">
          {statFields.map(([key, label]) => (
            <Field key={key} label={label}>
              <input
                type="number"
                step="any"
                className={inputClass}
                value={value[key] as number}
                onChange={(e) => set(key, num(e.target.value) as HeroInput[typeof key])}
              />
            </Field>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[13px] font-semibold uppercase tracking-[0.1em] text-white">Abilities</span>
          <button
            type="button"
            onClick={() => set('abilities', [...value.abilities, { name: '', icon: '', description: '' }])}
            className="h-8 rounded-full border border-line-strong px-3 text-[12px] font-semibold text-white"
          >
            + Add
          </button>
        </div>
        <div className="space-y-3">
          {value.abilities.map((ability, i) => (
            <div key={i} className="space-y-2 rounded-card border border-line bg-ink-800/70 p-3">
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  placeholder="Ability name"
                  value={ability.name}
                  onChange={(e) => {
                    const next = [...value.abilities];
                    next[i] = { ...next[i], name: e.target.value };
                    set('abilities', next);
                  }}
                />
                <button
                  type="button"
                  onClick={() => set('abilities', value.abilities.filter((_, idx) => idx !== i))}
                  className="h-11 shrink-0 rounded-card border border-line px-3 text-[12px] text-muted"
                >
                  Remove
                </button>
              </div>
              <input
                className={inputClass}
                placeholder="Icon URL (optional)"
                value={ability.icon ?? ''}
                onChange={(e) => {
                  const next = [...value.abilities];
                  next[i] = { ...next[i], icon: e.target.value };
                  set('abilities', next);
                }}
              />
              <textarea
                className={`${inputClass} h-20 resize-none py-2.5`}
                placeholder="Description"
                value={ability.description}
                onChange={(e) => {
                  const next = [...value.abilities];
                  next[i] = { ...next[i], description: e.target.value };
                  set('abilities', next);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="h-12 w-full rounded-full bg-accent font-display text-[14px] font-semibold uppercase tracking-[0.12em] text-white disabled:opacity-60"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}