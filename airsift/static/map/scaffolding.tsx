import React from 'react'

export const Footer = () => {
  return (
    <div className='px-4 mt-4 pb-3 uppercase font-cousine text-XS'>
      <img src={'/static/images/citizenSenseLogo.png'} className='mb-3 w-1/2' />
      <a href='https://citizensense.net/about/contact/'>Contact</a>
      <a className='ml-3' href='https://citizensense.net/about/terms/'>Terms &amp; Conditions</a>
    </div>
  )
}
