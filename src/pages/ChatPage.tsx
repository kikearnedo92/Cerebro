
import React from 'react'
import { useLocation } from 'react-router-dom'
import ConversationalChatInterface from '@/components/chat/ConversationalChatInterface'
import NucleoMemoryInterface from '@/components/chat/NucleoMemoryInterface'

const ChatPage = () => {
  const location = useLocation()
  const isNucleo = location.pathname.startsWith('/nucleo')

  console.log('💬 ChatPage - Current path:', location.pathname, 'Is Núcleo:', isNucleo)

  return isNucleo ? <NucleoMemoryInterface /> : <ConversationalChatInterface />
}

export default ChatPage
