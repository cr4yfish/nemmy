
import styles from "@/styles/ui/Input.module.css"

export default function Input({
    className="", onChange, value, placeholder="", type="text", name="", id="", label="Label", isError=false, errorText="Error"
} : {
    className?: string,
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
    value?: string,
    placeholder?: string,
    type?: string,
    name?: string,
    id?: string,
    label?: string,
    isError?: boolean,
    errorText?: string,
}) {

    return (
        <>
        
        <div className={`${styles.inputWrapper}`}>
            <label htmlFor={name}>{label}</label>
            <input 
                placeholder={placeholder} className={`${isError ? styles.inputError : styles.input} `} 
                type={type} id={id} name={name}  
                onChange={onChange}
                value={value}
                />
            {<span className="text-xs text-red-500 font-bold">{isError && errorText}</span>}
        </div>
        </>
    )
}