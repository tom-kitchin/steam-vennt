import { Router } from 'express'

import steamProfile from './steam-profile'
import openId from './open-id'

const router = Router()

// Add API routes
router.use(steamProfile)
router.use(openId)

export default router
