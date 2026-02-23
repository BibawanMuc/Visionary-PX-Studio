import React from 'react'
import { useMemo } from 'react'
import { Package, ArrowRight, AlertCircle, CheckCircle, RefreshCw, TrendingUp, Euro, User, Wrench } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { InventarItem, InventarLoan } from '../types'

interface DashboardPageProps {
  items: InventarItem[]
  loans: InventarLoan[]
}

function StatCard({ label, value, icon: Icon, color, sub, alert }: {
  label: string; value: string | number; icon: React.ElementType; color: string; sub?: string; alert?: boolean
}) {
  return (
    <div className={`bg-slate-800/60 border rounded-2xl p-5 flex items-center gap-4 ${alert ? 'border-red-500/40 bg-red-500/5' : 'border-slate-700'}`}>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}>
        <Icon size={22} />
      </div>
      <div>
        <p className={`text-3xl font-bold ${alert ? 'text-red-300' : 'text-white'}`}>{value}</p>
        <p className="text-sm text-slate-400 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export function DashboardPage({ items, loans }: DashboardPageProps) {
  const navigate = useNavigate()

  const stats = useMemo(() => ({
    total: items.length,
    available: items.filter(i => i.status === 'Vorhanden').length,
    loaned: items.filter(i => i.status === 'Ausgeliehen').length,
    missing: items.filter(i => i.status === 'Fehlt').length,
    defective: items.filter(i => i.status === 'Defekt').length,
    totalValue: items.reduce((sum, i) => sum + (i.anschaffungspreis || 0), 0),
    assigned: items.filter(i => i.assigned_to_name).length,
  }), [items])

  const activeLoans = loans.filter(l => !l.zurueck_am)
  const overdueLoans = activeLoans.filter(l => l.zurueck_bis && new Date(l.zurueck_bis) < new Date())

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {}
    items.forEach(i => { map[i.geraet] = (map[i.geraet] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [items])

  const byPerson = useMemo(() => {
    const map: Record<string, number> = {}
    items.forEach(i => { if (i.assigned_to_name) map[i.assigned_to_name] = (map[i.assigned_to_name] || 0) + 1 })
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8)
  }, [items])

  const defectItems = useMemo(() =>
    items.filter(i => i.status === 'Defekt' || i.status === 'Fehlt')
      .sort((a, b) => (a.status === 'Defekt' ? -1 : 1) - (b.status === 'Defekt' ? -1 : 1))
  , [items])

  const valueStr = stats.totalValue > 0
    ? stats.totalValue.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
    : '–'

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Überblick über das PX-Inventar</p>
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Gesamt Artikel" value={stats.total} icon={Package} color="bg-brand-500/20 text-brand-300" />
        <StatCard label="Verfügbar" value={stats.available} icon={CheckCircle} color="bg-emerald-500/20 text-emerald-300" />
        <StatCard label="Ausgeliehen" value={stats.loaned} icon={RefreshCw} color="bg-amber-500/20 text-amber-300" />
        <StatCard
          label="Defekt / Fehlt"
          value={stats.defective + stats.missing}
          icon={AlertCircle}
          color="bg-red-500/20 text-red-300"
          alert={stats.defective + stats.missing > 0}
          sub={stats.defective > 0 ? `${stats.defective} defekt, ${stats.missing} fehlend` : undefined}
        />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Gesamtwert (Anschaffung)" value={valueStr} icon={Euro} color="bg-violet-500/20 text-violet-300" />
        <StatCard label="Zugewiesen" value={`${stats.assigned} / ${stats.total}`} icon={User} color="bg-sky-500/20 text-sky-300" />
        <StatCard
          label="Aktive Ausleihen"
          value={activeLoans.length}
          icon={Wrench}
          color="bg-orange-500/20 text-orange-300"
          sub={overdueLoans.length > 0 ? `⚠️ ${overdueLoans.length} überfällig` : undefined}
          alert={overdueLoans.length > 0}
        />
      </div>

      {/* Feature 8: Defekte & Fehlende Geräte Panel */}
      <div className={`border rounded-2xl overflow-hidden ${
        defectItems.length > 0 ? 'border-red-500/30 bg-red-500/5' : 'border-slate-700 bg-slate-800/60'
      }`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <h2 className="font-semibold flex items-center gap-2">
            {defectItems.length > 0 ? (
              <>
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <span className="text-red-300">Defekte &amp; Fehlende Geräte</span>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                  {defectItems.length} Geräte
                </span>
              </>
            ) : (
              <>
                <span className="text-emerald-400">✓</span>
                <span className="text-slate-300">Alle Geräte in Ordnung</span>
              </>
            )}
          </h2>
          <button onClick={() => navigate('/inventar')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Im Inventar ansehen <ArrowRight size={12} />
          </button>
        </div>
        {defectItems.length === 0 ? (
          <p className="text-slate-500 text-sm px-6 py-4">Keine defekten oder fehlenden Geräte. 🎉</p>
        ) : (
          <div className="divide-y divide-slate-800">
            {defectItems.map(item => (
              <div key={item.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm text-white font-medium">{item.geraet}{item.modell ? ` — ${item.modell}` : ''}</p>
                  <p className="text-xs text-slate-500">
                    {item.px_nummer && <span className="font-mono mr-2">{item.px_nummer}</span>}
                    {item.ort && <span className="mr-2">{item.ort}</span>}
                    {item.assigned_to_name && <span>👤 {item.assigned_to_name}</span>}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  item.status === 'Defekt'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/20'
                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/20'
                }`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aktive Ausleihen Liste */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <RefreshCw size={16} className="text-amber-400" /> Aktive Ausleihen
              {overdueLoans.length > 0 && (
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                  {overdueLoans.length} überfällig
                </span>
              )}
            </h2>
            <button onClick={() => navigate('/verleih')} className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1">
              Alle <ArrowRight size={12} />
            </button>
          </div>
          {activeLoans.length === 0 ? (
            <p className="text-slate-500 text-sm">Keine aktiven Ausleihen</p>
          ) : (
            <div className="space-y-2">
              {activeLoans.slice(0, 7).map(loan => {
                const overdue = loan.zurueck_bis && new Date(loan.zurueck_bis) < new Date()
                return (
                  <div key={loan.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <div>
                      <p className="text-sm text-white font-medium">
                        {loan.item?.geraet} <span className="text-slate-400 font-normal">→ {loan.profile?.full_name || loan.mitarbeiter_name}</span>
                      </p>
                      <p className="text-xs text-slate-500">{loan.item?.px_nummer} · {loan.zweck || ''}</p>
                    </div>
                    {overdue && <span className="text-xs text-red-400 shrink-0">Überfällig</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Kategorie-Breakdown */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-brand-400" /> Top Kategorien
          </h2>
          <div className="space-y-2.5">
            {byCategory.map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm text-slate-300 w-32 truncate">{name}</span>
                <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                  <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (count / byCategory[0][1]) * 100)}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Person-Breakdown */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
          <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
            <User size={16} className="text-sky-400" /> Geräte pro Person
          </h2>
          <div className="space-y-2.5">
            {byPerson.map(([name, count]) => (
              <div key={name} className="flex items-center gap-3">
                <span className="text-sm text-slate-300 w-32 truncate">{name}</span>
                <div className="flex-1 bg-slate-700 rounded-full h-1.5">
                  <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (count / byPerson[0][1]) * 100)}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}


