import { Router } from 'express'

import steamProfile from './steam-profile'
import openId from './openid'

const router = Router()

// Add API routes
router.use(steamProfile)
router.use(openId)

export default router
