import { Router } from 'express'

import steamProfile from './steam-profile'

const router = Router()

// Add steam profile routes
router.use(steamProfile)

export default router
