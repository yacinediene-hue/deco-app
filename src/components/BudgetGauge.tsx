interface Props {
  totalFcfa: number;
  budgetFcfa: number;
}

function formatFcfa(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

export default function BudgetGauge({ totalFcfa, budgetFcfa }: Props) {
  const pct = Math.min(100, Math.round((totalFcfa / budgetFcfa) * 100));
  const remaining = budgetFcfa - totalFcfa;
  const over = totalFcfa > budgetFcfa;

  const barColor = pct < 70 ? "bg-green-500" : pct < 90 ? "bg-amber-500" : "bg-red-500";
  const textColor = pct < 70 ? "text-green-700" : pct < 90 ? "text-amber-700" : "text-red-600";

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Panier vs budget</span>
        <span className={`text-xs font-bold ${textColor}`}>{pct}%</span>
      </div>

      {/* Barre */}
      <div className="w-full bg-stone-100 rounded-full h-3 mb-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Légende */}
      <div className="flex items-center justify-between text-xs">
        <div>
          <p className="text-stone-400">Estimation</p>
          <p className="font-bold text-stone-800">{formatFcfa(totalFcfa)}</p>
        </div>
        <div className="text-right">
          <p className="text-stone-400">Budget</p>
          <p className="font-bold text-stone-800">{formatFcfa(budgetFcfa)}</p>
        </div>
      </div>

      {over ? (
        <p className="mt-2 text-xs text-red-600 font-medium">
          ⚠️ Dépassement de {formatFcfa(Math.abs(remaining))} — considère le budget Intermédiaire.
        </p>
      ) : (
        <p className={`mt-2 text-xs ${textColor} font-medium`}>
          ✓ Il reste {formatFcfa(remaining)} dans ton budget.
        </p>
      )}
    </div>
  );
}
