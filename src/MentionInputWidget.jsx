import { Component, createElement } from "react";

import MentionInputContainer from "./components/MentionInputContainer";
import "./ui/MentionInputWidget.css";

export default class MentionInputWidget extends Component {
    onEnterHandler = this.onEnter.bind(this);

    render() {
        const {
            placeholder,
            renderMode,
            valueAttribute,
            datasource,
            suggestionContent,
            objLabel,
            mentionTrigger,
            keepTriggerSymbol,
            allowSuggestionsAboveCursor,
            allowSpaceInQuery,
            emojiEnabled,
            emojiPickerTheme,
            emojiTopbarColor,
            autoFocusSearch,
            autoConvertEmoji,
            onLeaveAction,
            onChangeAction,
            onAddMentionAction,
            onRemoveMentionAction
        } = this.props;
        return (
            <MentionInputContainer
                placeholder={placeholder}
                renderMode={renderMode}
                valueAttribute={valueAttribute}
                datasource={datasource}
                suggestionContent={suggestionContent}
                objLabel={objLabel}
                mentionTrigger={mentionTrigger}
                keepTriggerSymbol={keepTriggerSymbol}
                allowSuggestionsAboveCursor={allowSuggestionsAboveCursor}
                allowSpaceInQuery={allowSpaceInQuery}
                emojiEnabled={emojiEnabled}
                emojiPickerTheme={emojiPickerTheme}
                emojiTopbarColor={emojiTopbarColor}
                autoFocusSearch={autoFocusSearch}
                autoConvertEmoji={autoConvertEmoji}
                onEnterAction={this.onEnterHandler}
                onLeaveAction={onLeaveAction}
                onChangeAction={onChangeAction}
                onAddMentionAction={onAddMentionAction}
                onRemoveMentionAction={onRemoveMentionAction}
            />
        );
    }

    onEnter() {
        if (this.props.onEnterAction && this.props.onEnterAction.canExecute) {
            this.props.onEnterAction.execute();
        }
    }
}
