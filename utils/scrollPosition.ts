export const getStorage = () => localStorage;

export const saveScrollPos = (asPath: string) => {
  try {
    getStorage().setItem(
      `scrollPos:${asPath}`,
      JSON.stringify({ x: window.scrollX, y: window.scrollY }),
    );
    // eslint-disable-next-line no-empty
  } catch (error) {}
};

export const restoreScrollPos = (asPath: string) => {
  try {
    const json = getStorage().getItem(`scrollPos:${asPath}`);
    const scrollPos = json ? JSON.parse(json) : undefined;
    if (scrollPos && scrollPos.y) {
      window.scrollTo(scrollPos.x, scrollPos.y);
    }
    // eslint-disable-next-line no-empty
  } catch (e) {}
};

export const deleteScrollPos = (asPath: string) => {
  try {
    getStorage().removeItem(`scrollPos:${asPath}`);
    // eslint-disable-next-line no-empty
  } catch (error) {}
};
