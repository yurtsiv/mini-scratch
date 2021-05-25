import React from 'react'

export function TurnLeftIcon(props: any = {}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="30"
      height="30"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="M21.38 11.83h-7.61a.59.59 0 01-.43-1l1.75-2.19a5.9 5.9 0 00-4.7-1.58 5.07 5.07 0 00-4.11 3.17A6 6 0 007 15.77a6.51 6.51 0 005 2.92 1.31 1.31 0 01-.08 2.62 9.3 9.3 0 01-7.35-3.82 9.16 9.16 0 01-1.4-8.37A8.51 8.51 0 015.71 5.4a8.76 8.76 0 014.11-1.92 9.71 9.71 0 017.75 2.07l1.67-2.1a.59.59 0 011 .21L22 11.08a.59.59 0 01-.62.75z"
        fill="#fff"
        style={{
          transform: 'scaleX(-1)',
          transformOrigin: 'center',
        }}
      />
    </svg>
  )
}
