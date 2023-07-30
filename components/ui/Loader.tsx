import styles from "../../styles/ui/Loader.module.css";

export default function Loader() {
  return (
    <div className={`${styles.loader} mt-4`} key={"loader"}>
      <div className="h-20 w-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 max-md:hidden"></div>
      <div className="flex h-full w-full flex-col gap-4">
        <div className="h-4 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="h-6 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
        <div className="h-12 w-full rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
        <div className=" flex h-6 w-full gap-4">
          <div className="h-full w-12 rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="h-full w-8 rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
          <div className="h-full w-8 rounded-lg bg-neutral-200 dark:bg-neutral-800"></div>
        </div>
      </div>
    </div>
  );
}
