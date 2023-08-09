import React from 'react'

export function Helloworld({ text }: {
  text: string
}) {
  return <div className="text">{text}</div>
}