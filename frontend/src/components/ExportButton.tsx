import { useEffect } from "react";
import { Button } from "@heroui/react";
import { motion, useAnimation } from "framer-motion";
import { CreateModZip } from "../../wailsjs/go/main/App";

interface ExportButtonProps {
  children?: React.ReactNode;
}

function ExportButton({ children }: ExportButtonProps) {
  const controls = useAnimation();

  // 自訂振動序列，使用 rotate
  const vibrateSequence = async () => {
    while (true) {
      // 快速振動：細微的左右旋轉
      await controls.start({
        rotate: [0, 3, -3, 3, 0], // 細微角度變化模擬振動
        transition: {
          duration: 0.2, // 快速振動，短時間內完成
          ease: "easeInOut", // 平滑過渡
        },
      });
      // 振動之間的間隔
      await new Promise((resolve) => setTimeout(resolve, 1500)); // 0.8 秒停頓
    }
  };

  // 當元件掛載時啟動動畫
  useEffect(() => {
    vibrateSequence();
  }, [controls]);

  return (
    <motion.div
      animate={controls}
      className="inline-block origin-center self-center"
    >
      <Button
        className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
        radius="full"
        size="lg"
        onPress={() => {
          CreateModZip();
        }}
      >
        {children}
      </Button>
    </motion.div>
  );
}

export default ExportButton;
