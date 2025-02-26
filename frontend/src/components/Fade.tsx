import { motion, AnimatePresence } from "framer-motion";

interface FadeProps {
  in: boolean;
  children: React.ReactNode;
}

function Fade({ in: isIn, children }: FadeProps) {
  return (
    <AnimatePresence>
      {isIn && (
        <motion.div
          // 初始狀態
          initial={{ opacity: 0 }}
          // 進入時的狀態
          animate={{ opacity: 1 }}
          // 離開時的狀態
          exit={{ opacity: 0 }}
          // 過渡效果
          transition={{
            duration: 0.3, // 淡入淡出持續 0.3 秒
            ease: "easeInOut",
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Fade;
