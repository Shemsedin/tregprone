const STEPS = [
  {
    step: '1',
    title: 'Kërko',
    desc: 'Gjej pronën ideale duke filtruar sipas qytetit, çmimit dhe tipit.',
  },
  {
    step: '2',
    title: 'Kontakto',
    desc: 'Dërgo mesazh direkt tek agjentit ose pronari pa regjistruar llogari.',
  },
  {
    step: '3',
    title: 'Merr pronën',
    desc: 'Takohu me pronarin, inspekto pronën dhe bëhu pronar i ri.',
  },
];

export function HowItWorks() {
  return (
    <section className="border-border bg-surface border-t px-4 py-16">
      <div className="max-w-page mx-auto">
        <h2 className="text-fg text-center text-2xl font-bold">Si funksionon</h2>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center">
              <div className="bg-border text-fg flex h-12 w-12 items-center justify-center rounded-full border text-xl font-bold">
                {item.step}
              </div>
              <h3 className="text-fg mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="text-muted mt-2 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
