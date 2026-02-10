import { Car } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const VehicleFloatingButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on the vehicle emergency page itself
  if (location.pathname === "/emergencia-veicular") return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/emergencia-veicular")}
        className="fixed bottom-6 left-6 z-40 w-14 h-14 rounded-full bg-warning text-warning-foreground shadow-medium flex items-center justify-center"
        aria-label="Emergência Veicular"
      >
        <Car className="w-6 h-6" />
      </motion.button>
    </AnimatePresence>
  );
};

export default VehicleFloatingButton;
