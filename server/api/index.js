import { Router } from 'express'

import steamProfile from './steam-profile'

const router = Router()

// Add API routes
router.use(steamProfile)

export default router
