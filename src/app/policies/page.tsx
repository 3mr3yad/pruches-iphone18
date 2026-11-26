import type { Metadata } from 'next';
import { Footer } from '@/components/sections/Footer';
import { POLICIES, POLICIES_PAGE, type PolicyBlock } from '@/lib/policies';
import { OvfleWordmark } from '@/components/brand/OvfleWordmark';

export const metadata: Metadata = {
  title: `${POLICIES_PAGE.title} — عالم وافي`,
  description: POLICIES_PAGE.lead,
};

const BackArrow = () => (
  <svg viewBox="0 0 16 16" width={14} height={14} aria-hidden>
    <path
      d="M2 8h12M9.5 2.5L15 8l-5.5 5.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function Block({ block }: { block: PolicyBlock }) {
  switch (block.type) {
    case 'h':
      return <h3 className="mt-3 text-[17px] font-bold text-white lg:text-lg">{block.text}</h3>;
    case 'p':
      return <p className="text-[15px] leading-[2] text-body lg:text-base">{block.text}</p>;
    case 'note':
      return (
        <p className="rounded-xl border border-pink/25 bg-pink/[0.06] px-4 py-3 text-sm font-semibold leading-[1.9] text-pink">
          {block.text}
        </p>
      );
    case 'link':
      return (
        <a
          href={block.href}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start text-sm font-semibold text-pink underline decoration-pink/40 underline-offset-4 transition-colors duration-200 ease-quint hover:decoration-pink"
        >
          {block.text}
        </a>
      );
    case 'ul':
      return (
        <ul className="flex flex-col gap-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex gap-3 text-[15px] leading-[1.95] text-body lg:text-base">
              <span aria-hidden className="mt-[0.85em] size-1.5 shrink-0 rounded-full bg-pink/70" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    case 'table':
      return (
        // Wide tables (3–4 columns) scroll sideways on phones instead of squeezing.
        <div className="overflow-x-auto rounded-2xl border border-line-2">
          <table className="w-full min-w-[480px] text-start text-sm lg:text-[15px]">
            {block.caption ? (
              <caption className="border-b border-line-2 bg-card px-4 py-3 text-start text-sm font-bold leading-[1.7] text-white">
                {block.caption}
              </caption>
            ) : null}
            <thead>
              <tr className="border-b border-line-2 text-muted">
                {block.head.map((cell) => (
                  <th key={cell} scope="col" className="px-4 py-2.5 text-start font-semibold">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row) => (
                <tr key={row[0]} className="border-b border-line last:border-b-0">
                  {row.map((cell, index) =>
                    index === 0 ? (
                      <th key={index} scope="row" className="px-4 py-3 text-start font-normal leading-[1.7] text-body">
                        {cell}
                      </th>
                    ) : (
                      <td key={index} className="px-4 py-3 font-semibold leading-[1.7] text-white">
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export default function PoliciesPage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-[rgba(8,7,8,0.86)] backdrop-blur-[7px]">
        <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between px-gutter lg:h-[72px] lg:px-20">
          <a href="/" className="-ms-2 inline-flex min-h-11 items-center px-2" aria-label="Ovfle — الصفحة الرئيسية">
            <OvfleWordmark className="text-[1.6rem] lg:text-[1.9rem]" />
          </a>
          <a
            href="/"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-body transition-colors duration-200 ease-quint hover:text-white"
          >
            {/* Same direction as the flow's «رجوع» (back = right in RTL). */}
            <BackArrow />
            {POLICIES_PAGE.backHome}
          </a>
        </div>
      </header>

      <main className="px-gutter pb-20 pt-10 lg:px-20 lg:pb-28 lg:pt-16">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-[780px]">
            <p className="text-[13px] font-semibold text-pink lg:text-sm">{POLICIES_PAGE.company}</p>
            <h1 className="mt-2 text-[30px] font-extrabold leading-[1.35] text-white lg:text-[44px]">
              {POLICIES_PAGE.title}
            </h1>
            <p className="mt-3 inline-block rounded-pill border border-pink/30 px-3 py-1 font-latin text-xs font-semibold text-pink">
              {POLICIES_PAGE.version}
            </p>
            <p className="mt-4 text-[15px] leading-[1.95] text-body lg:text-[17px]">{POLICIES_PAGE.lead}</p>
          </div>

          <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
            {/* RTL: the contents list leads, so it sits on the right on desktop. */}
            <nav aria-label={POLICIES_PAGE.tocLabel} className="lg:sticky lg:top-[96px] lg:self-start">
              <details className="group rounded-2xl border border-line-2 bg-card lg:hidden">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-bold text-white">
                  {POLICIES_PAGE.tocLabel}
                  <svg
                    aria-hidden
                    viewBox="0 0 10 6"
                    width={10}
                    height={6}
                    className="text-muted transition-transform duration-200 group-open:rotate-180"
                  >
                    <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </summary>
                <TocList />
              </details>
              <div className="hidden lg:block">
                <p className="mb-3 text-sm font-bold text-white">{POLICIES_PAGE.tocLabel}</p>
                <TocList />
              </div>
            </nav>

            <div className="flex min-w-0 flex-col gap-12 lg:gap-14">
              {POLICIES.map((section) => (
                <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-24">
                  {section.kicker ? (
                    <p className="text-[13px] font-semibold text-pink">{section.kicker}</p>
                  ) : null}
                  <h2
                    id={`${section.id}-title`}
                    className="mt-1 border-b border-line pb-4 text-[22px] font-extrabold leading-[1.5] text-white lg:text-[28px]"
                  >
                    {section.title}
                  </h2>
                  <div className="mt-5 flex flex-col gap-4">
                    {section.blocks.map((block, index) => (
                      <Block key={index} block={block} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

function TocList() {
  return (
    <ol className="flex flex-col gap-0.5 px-2 pb-3 lg:px-0 lg:pb-0">
      {POLICIES.map((section) => (
        <li key={section.id}>
          <a
            href={`#${section.id}`}
            className="flex min-h-10 flex-col justify-center rounded-lg px-2 py-1.5 text-[13.5px] leading-[1.6] text-body transition-colors duration-200 ease-quint hover:bg-white/[0.04] hover:text-white"
          >
            {section.kicker ? <span className="text-[11px] text-muted">{section.kicker}</span> : null}
            {section.title}
          </a>
        </li>
      ))}
    </ol>
  );
}
