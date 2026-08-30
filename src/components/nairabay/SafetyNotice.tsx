export function SafetyNotice({ bayHandle }: { bayHandle?: string | undefined }) {
  return (
    <div className="rounded-xl border border-warning-foreground/20 bg-warning p-4 text-warning-foreground">
      <p className="text-sm font-extrabold uppercase tracking-wide">🛑 NairaBay safety warning</p>
      <p className="mt-2 text-sm leading-relaxed">
        <strong>Never pay anyone in advance.</strong> No delivery fees, no commitment fees, no
        reservation money. Meet the seller in a public place (a mall, bank or busy junction),
        inspect the item, then pay.
      </p>
      {bayHandle ? (
        <a
          href={`mailto:report@nairabay.ng?subject=${encodeURIComponent(`Report ${bayHandle}`)}`}
          className="mt-3 inline-block text-sm font-bold underline underline-offset-4"
        >
          Report #{bayHandle}
        </a>
      ) : null}
    </div>
  );
}
