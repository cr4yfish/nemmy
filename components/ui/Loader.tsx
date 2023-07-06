
import styles from "../../styles/ui/Loader.module.css";

export default function Loader() {
    return (
        <>
        <div className={styles.loader}>
            <div className="h-14 w-4 dark:bg-neutral-800 rounded-lg max-md:hidden"></div>
            <div className="flex flex-col gap-4 w-full h-full">
                <div className="w-full h-4 dark:bg-neutral-800 rounded-lg"></div>
                <div className="w-full h-6 dark:bg-neutral-800 rounded-lg"></div>
                <div className="w-full h-12 dark:bg-neutral-800 rounded-lg"></div>
            </div>
        </div>
        </>
    )
}