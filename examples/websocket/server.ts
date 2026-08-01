/**
 * ARCHITECTURAL WEBSOCKET SERVER
 * Role: Core communication hub with integrated diagnostic telemetry.
 * Integration: Connects to diagnostic-utils.ts for system health monitoring.
 */

import { createServer } from 'http'
import { Server } from 'socket.io'
import { runSystemDiagnostics, initializeServerContext } from './diagnostic-utils'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Initialize diagnostic context
initializeServerContext()

interface User {
  id: string
  username: string
}

interface Message {
  id: string
  username: string
  content: string
  timestamp: Date
  type: 'user' | 'system'
}

const users = new Map<string, User>()

const generateMessageId = () => Math.random().toString(36).substr(2, 9)

const createSystemMessage = (content: string): Message => ({
  id: generateMessageId(),
  username: 'System',
  content,
  timestamp: new Date(),
  type: 'system'
})

const createUserMessage = (username: string, content: string): Message => ({
  id: generateMessageId(),
  username,
  content,
  timestamp: new Date(),
  type: 'user'
})

io.on('connection', (socket) => {
  console.log(`[CONN] User connected: ${socket.id}`)

  socket.on('diagnostics', async () => {
    const report = await runSystemDiagnostics()
    socket.emit('diagnostic-report', report)
  })

  socket.on('test', (data) => {
    socket.emit('test-response', { 
      message: 'Server received test message', 
      data: data,
      timestamp: new Date().toISOString()
    })
  })

  socket.on('join', (data: { username: string }) => {
    const { username } = data || {}
    if (!username || typeof username !== 'string') return

    const user: User = { id: socket.id, username }
    users.set(socket.id, user)
    
    const joinMessage = createSystemMessage(`${username} joined the chat room`)
    io.emit('user-joined', { user, message: joinMessage })
    io.emit('users-list', { users: Array.from(users.values()) })
  })

  socket.on('message', (data: { content: string; username: string }) => {
    const { content, username } = data || {}
    if (!content || !username) return

    const user = users.get(socket.id)
    if (user && user.username === username) {
      io.emit('message', createUserMessage(username, content))
    }
  })

  socket.on('disconnect', () => {
    const user = users.get(socket.id)
    if (user) {
      users.delete(socket.id)
      const leaveMessage = createSystemMessage(`${user.username} left the chat room`)
      io.emit('user-left', { user: { id: socket.id, username: user.username }, message: leaveMessage })
      io.emit('users-list', { users: Array.from(users.values()) })
    }
  })
})

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3003
httpServer.listen(PORT, () => {
  console.log(`[SYSTEM] WebSocket server running on port ${PORT}`)
})

const shutdown = () => {
  console.log('[SYSTEM] Shutting down server...')
  httpServer.close(() => process.exit(0))
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
