import { Button } from "@heroui/react";

interface ExportButtonProps {
  onPress?: () => void;
  children?: React.ReactNode;
}

function ExportButton({ onPress, children }: ExportButtonProps) {
  return (
    <div className="w-[200px] justify-self-center mt-4">
      <Button
        className="bg-gradient-to-tr from-pink-500 to-yellow-500 text-white shadow-lg"
        radius="full"
        size="lg"
        fullWidth
        onPress={onPress}
      >
        {children}
      </Button>
    </div>
  );
}

export default ExportButton;
