import React from 'react'
import { Button } from '@/shared/button'

export function Helloworld({ text }: {
  text: string
}) {
  return (
    <div className="text">
      <span>{text}</span>
      <Button>test btn</Button>
    </div>
  )
}