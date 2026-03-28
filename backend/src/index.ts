import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth'
import userRoutes from './routes/users'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Workplanner API is running' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
