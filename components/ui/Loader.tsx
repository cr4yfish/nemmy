
import styles from "../../styles/ui/Loader.module.css";

export default function Loader() {
    return (
        <div className={`${styles.loader} mt-4`} key={"loader"}>
            <div className="h-20 w-8 bg-neutral-200 dark:bg-neutral-800 rounded-lg max-md:hidden"></div>
            <div className="flex flex-col gap-4 w-full h-full">
                <div className="w-full h-4 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                <div className="w-full h-6 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                <div className="w-full h-12 bg-neutral-200 dark:bg-neutral-800 rounded-lg"></div>
                <div className=" w-full h-6 flex gap-4">
                    <div className="bg-neutral-200 dark:bg-neutral-800 w-12 h-full rounded-lg"></div>
                    <div className="bg-neutral-200 dark:bg-neutral-800 w-8 h-full rounded-lg"></div>
                    <div className="bg-neutral-200 dark:bg-neutral-800 w-8 h-full rounded-lg"></div>
                </div>
            </div>
        </div>
    )
}