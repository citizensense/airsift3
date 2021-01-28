import React from 'react'

export const Footer = () => {
  return (
    <div className='px-4 mt-4 pb-3 uppercase font-cousine text-XS'>
      <a href='https://citizensense.net' target='_blank'>
        <img src={'/static/images/citizenSenseLogo.png'} className='mb-3 w-1/2' />
      </a>
      <a href='https://citizensense.net/about/contact/'>Contact</a>
      <a className='ml-3' href='https://citizensense.net/about/terms/'>Terms &amp; Conditions</a>
      <br />
      <a href='https://commonknowledge.coop'>Site by Common Knowledge</a>
    </div>
  )
}
