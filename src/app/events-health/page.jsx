'use client';
import { useEffect, useMemo } from 'react';
import { Activity, TrendingUp, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Header from '../../components/header';
import StatusCard from '../../components/status-card';
import { useEventStore } from '../../store/eventStore';
import { usePaymentStore } from '../../store/paymentStore';

const STATUS_BAR = {
  Completed: { w: 100, color: 'bg-green-500' },
  Confirmed: { w: 75, color: 'bg-blue-500' },
  'In Progress': { w: 50, color: 'bg-amber-500' },
  Pending: { w: 20, color: 'bg-slate-600' },
};

export default function EventsHealthPage() {
  const { events, init } = useEventStore();
  const { payments, init: initPay } = usePaymentStore();
  useEffect(() => { init(); initPay(); }, []);

  const healthData = useMemo(() => events.map(ev => {
    const inc = payments.filter(p => p.eventId === ev.id && p.type === 'incoming');
    const out = payments.filter(p => p.eventId === ev.id && p.type === 'outgoing');
    const totalIn = inc.reduce((a, p) => a + p.amount, 0);
    const totalOut = out.reduce((a, p) => a + p.amount, 0);
    const paidIn = inc.filter(p => p.status === 'Paid').reduce((a, p) => a + p.amount, 0);
    const paidOut = out.filter(p => p.status === 'Paid').reduce((a, p) => a + p.amount, 0);
    const daysToEvent = Math.ceil((new Date(ev.date) - new Date()) / 86400000);
    const payHealth = totalIn > 0 ? Math.round((paidIn / totalIn) * 100) : ev.paid > 0 ? Math.round((ev.paid / ev.budget) * 100) : 0;
    return { ...ev, totalIn, totalOut, paidIn, paidOut, daysToEvent, payHealth };
  }), [events, payments]);

  const overdue = healthData.filter(e => e.daysToEvent < 0 && e.status !== 'Completed').length;
  const upcoming7 = healthData.filter(e => e.daysToEvent >= 0 && e.daysToEvent <= 7).length;

  return (
    <div>
      <Header title="Events Health" subtitle="Track event progress & payment status" />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatusCard label="Total Events" value={events.length} icon={Activity} accent="amber" />
          <StatusCard label="On Track" value={events.filter(e => e.status === 'Confirmed' || e.status === 'Completed').length} accent="green" icon={CheckCircle2} />
          <StatusCard label="Due in 7 Days" value={upcoming7} accent="blue" icon={Clock} />
          <StatusCard label="Overdue" value={overdue} accent="red" icon={AlertCircle} />
        </div>

        <div className="space-y-3">
          {healthData.map(ev => {
            const bar = STATUS_BAR[ev.status] || { w: 0, color: 'bg-slate-600' };
            const urgency = ev.daysToEvent < 0 ? 'text-red-400' : ev.daysToEvent <= 7 ? 'text-amber-400' : 'text-slate-400';
            return (
              <div key={ev.id} className="bg-[#111827] border border-[#1e2530] rounded-xl p-4 hover:border-amber-500/20 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{ev.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ev.status === 'Completed' ? 'bg-green-500/15 text-green-400' :
                        ev.status === 'Confirmed' ? 'bg-blue-500/15 text-blue-400' :
                        ev.status === 'In Progress' ? 'bg-amber-500/15 text-amber-400' :
                        'bg-slate-500/15 text-slate-400'
                      }`}>{ev.status}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{ev.client} · {ev.city}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${urgency}`}>
                      {ev.daysToEvent < 0 ? `${Math.abs(ev.daysToEvent)}d overdue` : ev.daysToEvent === 0 ? 'Today!' : `${ev.daysToEvent}d to go`}
                    </p>
                    <p className="text-xs text-slate-500">{ev.date}</p>
                  </div>
                </div>

                {/* Progress bars */}
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Event Progress</span>
                      <span>{bar.w}%</span>
                    </div>
                    <div className="h-1.5 bg-[#1e2530] rounded-full overflow-hidden">
                      <div className={`h-full ${bar.color} rounded-full transition-all`} style={{ width: `${bar.w}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span>Payment Received</span>
                      <span>{ev.payHealth}% · ₹{(ev.paidIn || ev.paid || 0).toLocaleString()} / ₹{ev.budget?.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-[#1e2530] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${ev.payHealth >= 75 ? 'bg-green-500' : ev.payHealth >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                        style={{ width: `${ev.payHealth}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-[#1e2530]">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500">Budget</p>
                    <p className="text-xs font-semibold text-amber-400">₹{ev.budget?.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500">Guests</p>
                    <p className="text-xs font-semibold text-white">{ev.guests || '—'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500">Manager</p>
                    <p className="text-xs font-semibold text-white">{ev.manager || '—'}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500">Vendor Exp.</p>
                    <p className="text-xs font-semibold text-red-400">₹{ev.totalOut?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}