import React from 'react'

export const Spinner: React.FC<{
  size?: 'small' | 'large'
}> = ({ size = 'large' }) => {
  return (
    <svg className={`text-brand animate-spin ${size === 'small' ? 'w-5 h-5' : 'w-6 h-6'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-10 stroke-current text-inherit opacity-" cx="12" cy="12" r="10" strokeWidth="4"></circle>
      <path className="opacity-10 fill-current text-inherit opacity-" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
}
