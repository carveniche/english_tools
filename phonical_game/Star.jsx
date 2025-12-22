import { motion, AnimatePresence } from "framer-motion";
import React from 'react'

function Star({show}) {

  return (
    <AnimatePresence>
        {show && (
          <motion.div
            key={show}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none fixed inset-0 z-30 grid place-items-center"
          >
            <div className="text-7xl">🌟</div>
          </motion.div>
        )}
      </AnimatePresence>
  )
}

export default Star