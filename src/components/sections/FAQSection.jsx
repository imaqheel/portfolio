import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: 'How long does a website project usually take?',
    answer:
      'A landing page can usually be completed in 2 to 3 days when the content is ready. A standard business website typically takes around one week depending on page count, content, and feedback speed.',
  },
  {
    question: 'Do I need to provide content and images?',
    answer:
      'If you already have content, logo, product photos, or brand references, the process becomes faster. If not, I can help structure clean website copy and suggest the right sections for your business.',
  },
  {
    question: 'Can you connect WhatsApp, calls, or forms?',
    answer:
      'Yes. I can add WhatsApp message buttons, direct call actions, contact forms, Google Forms, and lead-focused CTA flows so visitors know exactly what to do next.',
  },
  {
    question: 'Will the website work well on mobile?',
    answer:
      'Yes. Every layout is built mobile-first and tested responsively so the website feels clean, readable, and easy to use across phones, tablets, and desktop screens.',
  },
  {
    question: 'What happens after the website is completed?',
    answer:
      'After delivery, I can help with deployment basics, small refinements, and guidance on what to update later as your business grows.',
  },
]

function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null)

  function toggleRow(index) {
    setActiveIndex((current) => (current === index ? null : index))
  }

  return (
    <section
      id="faq"
      className="font-display flex h-auto min-h-screen w-full items-center justify-center bg-slate-50 px-4 py-4 md:py-0"
    >
      <div className="liquid-glass-stage w-full max-w-7xl">
      <div className="liquid-glass-card w-full rounded-[36px] p-6 md:py-8 md:px-10 lg:py-10 lg:px-12">
        <span className="liquid-glass-layer liquid-glass-center" aria-hidden="true" />
        <span className="liquid-glass-layer liquid-glass-bottom" aria-hidden="true" />
        <span className="liquid-glass-layer liquid-glass-stroke" aria-hidden="true" />
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 className="text-4xl font-extrabold tracking-tight text-slate-950 md:text-5xl lg:text-5.5xl">
            FAQ.
          </h2>
          <p className="max-w-md text-sm font-semibold leading-normal text-slate-500 md:text-right md:text-base">
            Straight answers to your questions.
          </p>
        </div>

        <div className="liquid-glass-media rounded-[32px] border border-white/70 p-5 md:p-6 lg:p-8">
          <div class="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-950 md:text-3xl">
              Good to know
            </h3>
            <span className="rounded-full bg-white px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-slate-400 shadow-sm">
              {faqs.length} Answers
            </span>
          </div>

          <div className="space-y-4">
            {faqs.map((item, index) => {
              const open = activeIndex === index

              return (
                <article
                  key={item.question}
                  className={`overflow-hidden rounded-[24px] border transition duration-300 ${
                    open
                      ? 'border-slate-300 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.08)]'
                      : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white'
                  }`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-5 px-6 py-4.5 text-left md:px-8 md:py-5.5"
                    onClick={() => toggleRow(index)}
                    onFocus={() => setActiveIndex(index)}
                    onBlur={() => setActiveIndex(null)}
                    aria-expanded={open}
                  >
                    <span className="text-base font-extrabold leading-normal text-slate-950 md:text-lg lg:text-[1.15rem]">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`h-6 w-6 shrink-0 text-slate-500 transition-transform duration-300 ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm font-medium leading-relaxed text-slate-500 md:px-8 md:pb-6 md:text-base">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
      </div>
    </section>
  )
}

export default FAQSection
