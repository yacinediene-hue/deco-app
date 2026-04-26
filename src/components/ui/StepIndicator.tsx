interface Props {
  current: number;
  total: number;
  labels: string[];
}

export default function StepIndicator({ current, total, labels }: Props) {
  return (
    <div className="w-full px-4 py-3">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        {Array.from({ length: total }).map((_, i) => {
          const step = i + 1;
          const done = step < current;
          const active = step === current;
          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors
                    ${done ? "bg-amber-600 text-white" : active ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-400"}`}
                >
                  {done ? "✓" : step}
                </div>
                <span className={`text-[10px] mt-1 whitespace-nowrap ${active ? "text-stone-900 font-medium" : "text-stone-400"}`}>
                  {labels[i]}
                </span>
              </div>
              {step < total && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 ${done ? "bg-amber-600" : "bg-stone-200"}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
