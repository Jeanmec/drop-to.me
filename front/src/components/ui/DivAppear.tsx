import { motion } from "framer-motion";

type DivAppearProps = {
  className?: string;
  children?: React.ReactNode;
  once?: boolean;
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8 },
  },
};

export default function DivAppear({
  className,
  children,
  once,
}: DivAppearProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: once ?? true }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
