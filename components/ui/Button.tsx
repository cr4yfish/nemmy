
import { FadeLoader } from "react-spinners"

import styles from "@/styles/ui/Button.module.css";

export default function Button({
    children, type, onClick, disabled, className, loading, variant="primary"
} : {
    children: React.ReactNode;
    type?: "button" | "submit" | "reset";
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    loading?: boolean;
    variant?: "primary" | "secondary" | "tertiary";
}) {


    return (
        <>
        <button 
            type={type} 
            className={`${className} ${styles.button} ${styles[variant]} `}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
            {loading && <FadeLoader color="#fff" />}
            </button>
        </>
    )
}