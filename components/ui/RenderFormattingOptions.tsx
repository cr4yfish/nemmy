import { Dispatch, SetStateAction } from "react";

/**
 * Find the word located in the string with a numeric index.
 *
 * @return {String}
 */
const getClosestWord = (str: string, pos: number): string => {
  console.log("at index:", pos)
  // Perform type conversions.
  pos = Number(pos) >>> 0;

  // Search for the word's beginning and end.
  console.log("left.", str.slice(0, pos + 1).search(/\S+$/))
  console.log("right.", str.slice(pos).search(/\s/) + pos)
  var left = str.slice(0, pos + 1).search(/\S+$/),
      right = str.slice(pos).search(/\s/);

  // The last word in the string is a special case.
  if (right < 0) {
      return str.slice(left);
  }
  // Return the word, using the located bounds to extract it from the string.
  return str.slice(left, right + pos);
}

function FormattingOption({ 
  icon, text, setText, index, before, after }: { 
    icon: string, text?: string, 
    setText: (newText: string) => void, index: number, before: string, after: string }) {
    
      //       index is somewhere in a word
      // test1 test2 test3

      // output:
      // test1 before + test2 + after test3

  const handleInsert = () => {
    if(!text) return setText(`${before}${after}`);

    const word = getClosestWord(text, index);

    console.log(text, index, word)

    let newText = text.replace(word, `${before}${word}${after}`);
  
    setText(newText);
  }

  return (
    <button onClick={handleInsert} type="button" className=" flex items-center text-neutral-400 dark:text-neutral-400">
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}

/**
 * Renders some Markdown formatting options.
 * Alters text state by inserting markdown syntax at index position.
 * @param param0 : { text: string, setText: Dispatch<SetStateAction<string>>, index: number }
 * @returns 
 */
export default function RenderFormattingOptions({ 
  text, setText, index } : { text?: string, setText: (newText: string) => void, index: number }) {
  return (
    <>
      <FormattingOption index={index} before="**" after="**" text={text} setText={setText} icon="format_bold" />
      <FormattingOption index={index} before="*" after="*" text={text} setText={setText} icon="format_italic" />
      <FormattingOption index={index} before="[](" after=")" text={text} setText={setText} icon="link" />
      <FormattingOption index={index} before="" after="" text={text} setText={setText} icon="add_reaction" />
      <FormattingOption index={index} before="![](" after=")" text={text} setText={setText} icon="add_photo_alternate" />
      <FormattingOption index={index} before="\n# " after="" text={text} setText={setText} icon="format_h1" />
      <FormattingOption index={index} before="~~" after="~~" text={text} setText={setText} icon="strikethrough_s" />
      <FormattingOption index={index} before=">" after="" text={text} setText={setText} icon="format_quote" />
      <FormattingOption index={index} before="-" after="" text={text} setText={setText} icon="format_list_bulleted" />
      <FormattingOption index={index} before="```" after="```" text={text} setText={setText} icon="code" />
      <FormattingOption index={index} before="" after="" text={text} setText={setText} icon="ad_group_off" />
      <FormattingOption index={index} before="" after="" text={text} setText={setText} icon="superscript" />
    </>
  );
}
