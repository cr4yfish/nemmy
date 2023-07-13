
function FormattingOption({icon} : { icon: string}) {
    return (
        <button className=" flex items-center text-neutral-400 dark:text-neutral-400"><span className="material-symbols-outlined">{icon}</span></button>
    )
}

export default function RenderFormattingOptions() {

    return (
        <>
        <FormattingOption icon="format_bold" />
        <FormattingOption icon="format_italic" />
        <FormattingOption icon="link" />
        <FormattingOption icon="add_reaction" />
        <FormattingOption icon="add_photo_alternate" />
        <FormattingOption icon="format_h1" />
        <FormattingOption icon="strikethrough_s" />
        <FormattingOption icon="format_quote" />
        <FormattingOption icon="format_list_bulleted" />
        <FormattingOption icon="code" />
        <FormattingOption icon="ad_group_off" />
        <FormattingOption icon="superscript" />
        </>
    )
}