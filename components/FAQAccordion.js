'use client'

import { useState } from 'react'

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 group"
        aria-expanded={open}
      >
        <span className="font-heading font-semibold text-navy group-hover:text-ark-yellow transition-colors">
          {question}
        </span>
        <svg
          className={`w-5 h-5 text-navy flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="pb-4 text-charcoal/70 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  )
}

export default function FAQAccordion({ items }) {
  return (
    <div className="divide-y divide-gray-200 rounded-2xl bg-white shadow-sm border border-gray-100 px-6">
      {items.map(({ question, answer }) => (
        <FAQItem key={question} question={question} answer={answer} />
      ))}
    </div>
  )
}
