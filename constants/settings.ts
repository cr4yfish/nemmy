/**
 * Valid instances Nemmy is allowed to switch to in case of instance downtime.
 * The order is semi-impoartant, as switching instances takes time,
 * but all instances will be tried out before giving up.
 */
export const BACKUP_INSTANCES = [
    "https://lemmy.ml",
    "https://lemmy.world",
    "https://sh.itjust.works",
    "https://lemmy.dbzer0.com",
    "https://lemmy.blahaj.zone",
    "https://feddit.de",
    "https://lemmy.one",
    "https://lemm.ee",
    "https://lemmy.ca",
    "https://lemmy.sdf.org",

]

export let DEFAULT_INSTANCE = BACKUP_INSTANCES[0];
export const DEFAULT_AVATAR = "https://i.imgur.com/IN6ZY30.png";
export const DEFAULT_POST_LIMIT = 2
export const DEFAULT_SORT_TYPE = "Active"


/**
 * Switches to the given instance
 * @param instance 
 */
export const switchInstances = (instance: string) => {
    DEFAULT_INSTANCE = instance;
}

/**
 * Switches to the next instance in the list
 */
export const nextInstance = () => {
    const index = BACKUP_INSTANCES.indexOf(DEFAULT_INSTANCE);
    if (index === BACKUP_INSTANCES.length - 1) {
        DEFAULT_INSTANCE = BACKUP_INSTANCES[0];
    } else {
        DEFAULT_INSTANCE = BACKUP_INSTANCES[index + 1];
    }
}