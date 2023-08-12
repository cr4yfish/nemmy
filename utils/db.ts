function replaceLastChar(str: string, replacement: string) {
    const lastIndex = str.lastIndexOf('}');
    if (lastIndex === -1) {
      return str;
    }
    return str.slice(0, lastIndex) + replacement;
}