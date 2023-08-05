import { Dispatch, SetStateAction } from "react";

/**
 * Find the word located in the string with a numeric index.
 *
 * @return {String}
 */
const getClosestWord = (str: string, pos: number): string => {
  // Perform type conversions.
  pos = Number(pos) >>> 0;

  // Search for the word's beginning and end.
  var left = str.slice(0, pos + 1).search(/\S+$/),
    right = str.slice(pos).search(/\s/);

  // The last word in the string is a special case.
  if (right < 0) {
    return str.slice(left);
  }
  // Return the word, using the located bounds to extract it from the string.
  return str.slice(left, right + pos);
};

function FormattingOption({
  icon,
  text,
  setText,
  selectionStart,
  selectionEnd,
  before,
  after,
}: {
  icon: string;
  text?: string;
  setText: (newText: string) => void;
  selectionStart: number;
  selectionEnd: number;
  before: string;
  after: string;
}) {
  const handleInsert = () => {
    if (!text) return setText(`${before}${after}`);

    let newText: string = text;

    if (selectionStart == selectionEnd) {
      // No selection
      const word = getClosestWord(text, selectionStart);
      newText = text.replace(word, `${before}${word}${after}`);
    } else {
      // Selection
      const selectedText = text.slice(selectionStart, selectionEnd);
      newText = text.replace(selectedText, `${before}${selectedText}${after}`);
    }

    setText(newText);
  };

  return (
    <button
      onClick={handleInsert}
      type="button"
      className=" flex items-center text-neutral-400 dark:text-neutral-400"
    >
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
  text,
  setText,
  selectionStart,
  selectionEnd,
}: {
  text?: string;
  setText: (newText: string) => void;
  selectionStart: number;
  selectionEnd: number;
}) {
  return (
    <>
      <FormattingOption
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        before="**"
        after="**"
        text={text}
        setText={setText}
        icon="format_bold"
      />
      <FormattingOption
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        before="*"
        after="*"
        text={text}
        setText={setText}
        icon="format_italic"
      />
      <FormattingOption
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        before="[]("
        after=")"
        text={text}
        setText={setText}
        icon="link"
      />
      <FormattingOption
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        before="![]("
        after=")"
        text={text}
        setText={setText}
        icon="add_photo_alternate"
      />
      <FormattingOption
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        before={`\n# `}
        after=""
        text={text}
        setText={setText}
        icon="format_h1"
      />
      <FormattingOption
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        before="~~"
        after="~~"
        text={text}
        setText={setText}
        icon="strikethrough_s"
      />
      <FormattingOption
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        before={`\n> `}
        after=""
        text={text}
        setText={setText}
        icon="format_quote"
      />
      <FormattingOption
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        before={`\n- `}
        after=""
        text={text}
        setText={setText}
        icon="format_list_bulleted"
      />
      <FormattingOption
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        before={`\`\`\`\n`}
        after={`\n\`\`\``}
        text={text}
        setText={setText}
        icon="code"
      />
      <FormattingOption
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        before={`\n::: spoiler spoiler\n`}
        after={`\n:::`}
        text={text}
        setText={setText}
        icon="ad_group_off"
      />
      <FormattingOption
        selectionStart={selectionStart}
        selectionEnd={selectionEnd}
        before=""
        after=""
        text={text}
        setText={setText}
        icon="superscript"
      />
    </>
  );
}
