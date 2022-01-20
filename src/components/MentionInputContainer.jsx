import React, { Component, createElement } from "react";

import "../ui/MentionInputWidget.css";

import { Mention, MentionsInput } from "react-mentions";

import NimblePicker from "emoji-mart/dist-es/components/picker/nimble-picker";
import NimbleEmojiIndex from "emoji-mart/dist-es/utils/emoji-index/nimble-emoji-index.js";
import "emoji-mart/css/emoji-mart.css";
import emojidata from "../data/google";

export default class MentionInputContainer extends Component {
    state = {
        value: "",
        initialValue: "",
        editedValue: "",
        data: "",
        mentions: [],
        showEmojis: false,
        readOnly: false,
        mentionHighlighter: null
    };

    placeholder = "";
    nodeRef = React.createRef();
    emojiRef = React.createRef();
    handleClickOutsideHandler = this.handleClickOutside.bind(this);
    onAddMentionHandler = this.onAddMention.bind(this);
    onAddEmojiHandler = this.onAddEmoji.bind(this);
    onLeaveHandler = this.onLeave.bind(this);

    componentDidMount() {
        this.placeholder = this.props.placeholder ? this.props.placeholder.value : "";

        // We have to add some standard mendix classes to the rendered divs so they automatically look correct based on custom styles already existing
        const mentionControl = this.nodeRef.current.querySelectorAll(".mentions__control");
        mentionControl[0].classList.add("form-group");

        document.addEventListener("mousedown", this.handleClickOutsideHandler, false);
    }

    componentWillUnmount() {
        document.removeEventListener("mousedown", this.handleClickOutsideHandler, false);
    }

    componentDidUpdate(prevProps) {
        // Check if widget is readonly
        if (prevProps.valueAttribute.status === "loading" && this.props.valueAttribute.status === "available") {
            this.checkReadOnly();
        }
        // ValueAttribute changed
        if (prevProps.valueAttribute.value !== this.props.valueAttribute.value) {
            this.setState({ value: this.props.valueAttribute.value });
            if (this.props.valueAttribute.value !== this.state.editedValue) {
                this.setState({ initialValue: this.props.valueAttribute.value });
            }
        }
        // datasource is loaded so we can create the mentionslist
        if (
            this.state.readOnly === false &&
            prevProps.datasource.status === "loading" &&
            this.props.datasource.status === "available"
        ) {
            this.loadData();
        }
    }

    checkReadOnly() {
        const mentionHighlighter = this.nodeRef.current.querySelectorAll(".mentions__highlighter")[0];
        const mentionInput = this.nodeRef.current.querySelectorAll(".mentions__input")[0];
        if (this.props.valueAttribute.readOnly) {
            this.setState({ readOnly: true });
            mentionHighlighter.classList.add("form-control-static");
            mentionInput.classList.add("form-control-static", "mx-textarea-input");
        } else {
            mentionHighlighter.classList.add("form-control");
            mentionInput.classList.add("form-control", "mx-textarea-input");
        }
    }

    loadData() {
        // Function for loading the list of object into the mention suggestions.
        console.debug("loadData started");
        const suggestionlist = [];
        this.props.datasource.items.forEach(mxObject => {
            const objLabel = this.props.objLabel.get(mxObject).value;
            const content = this.props.suggestionContent?.get(mxObject) ?? objLabel;
            const mentionObj = {
                id: mxObject.id,
                display: objLabel,
                content
            };
            suggestionlist.push(mentionObj);
        });
        this.setState({
            data: suggestionlist
        });
        console.debug("loadData finished");
    }

    onChangeValue = (event, newValue, newPlainTextValue, mentions) => {
        function isChanged(oldMentions, newMentions) {
            return oldMentions && newMentions && JSON.stringify(oldMentions) !== JSON.stringify(newMentions);
        }
        // Check for removed mentions
        if (isChanged(this.state.mentions, mentions)) {
            this.onRemoveMention(mentions);
        }

        // check for smileys typed in the text so we can automatically convert them:
        if (newValue && newValue.length > 0 && this.props.autoConvertEmoji && this.props.emojiEnabled) {
            newValue = this.convertTextToEmojis(newValue);
        }

        // When user changes the input of the text area we have to update the state and the actual Mendix value.
        this.setState({
            value: newValue,
            editedValue: newValue,
            mentions
        });
        this.props.valueAttribute.setValue(newValue);
    };

    onLeave() {
        if (this.props.onLeaveAction && this.props.onLeaveAction.canExecute) {
            this.props.onLeaveAction.execute();
        }
        // check for on change action here
        if (this.props.onChangeAction && this.props.onChangeAction.canExecute) {
            if (this.state.value !== this.state.initialValue) {
                this.props.onChangeAction.execute();
            }
        }
        this.setState({ initialValue: this.state.value });
    }

    suggestionItem = (suggestion, search, highlightedDisplay, index, focused) => (
        <div className={`user ${focused ? "focused" : ""}`}>{suggestion.content}</div>
    );

    displayTransform = (id, display) => {
        if (this.props.keepTriggerSymbol) {
            return this.props.mentionTrigger + display;
        }
        return display;
    };

    onAddMention(mention) {
        console.debug("addedMention=" + JSON.stringify(mention));
        // When someone is mentioned in the textarea we want to fire an action so the developer can control themselves what they want to do with it.
        if (this.props.onAddMentionAction && mention) {
            const mxObjectToAdd = this.props.datasource.items.find(mxObject => mxObject.id === mention);
            if (mxObjectToAdd) {
                this.props.onAddMentionAction(mxObjectToAdd).execute();
            }
        }
    }

    onRemoveMention(mentions) {
        const prevMentions = this.state.mentions;
        const currentMentions = mentions;

        const removedMention = prevMentions
            .filter(mention => !currentMentions.find(newMention => newMention.id === mention.id))
            .map(mention => ({ id: mention.id }));
        // Call onRemove
        if (removedMention && removedMention.length > 0 && this.props.onRemoveMentionAction) {
            console.debug("removedMention=" + JSON.stringify(removedMention));
            const mxObjectToRemove = this.props.datasource.items.find(mxObject => mxObject.id === removedMention[0].id);
            if (mxObjectToRemove && mxObjectToRemove.id != null) {
                this.props.onRemoveMentionAction(mxObjectToRemove).execute();
            }
        }
    }

    convertTextToEmojis = text => {
        const colonsRegex = new RegExp("(^|\\s):([)|D|(|P|O|o])+", "g");
        let newText = text;

        const match = colonsRegex.exec(text);

        if (match !== null) {
            const colons = match[2];
            const offset = match.index + match[1].length;

            newText = newText.slice(0, offset) + this.getEmoji(colons) + newText.slice(offset + 2);
        }
        return newText;
    };

    getEmoji = emoji => {
        let emoj;
        const emojiIndex = new NimbleEmojiIndex(emojidata);
        switch (emoji) {
            case "D":
                emoj = emojiIndex.search(":)")[1].native;
                break;
            case ")":
                emoj = emojiIndex.search(":)")[0].native;
                break;
            case "(":
                emoj = emojiIndex.search(":(")[0].native;
                break;
            case "P":
                emoj = emojiIndex.search(":P")[0].native;
                break;
            case "o":
                emoj = emojiIndex.search("Hushed")[0].native;
                break;
            case "O":
                emoj = emojiIndex.search("Hushed")[0].native;
                break;
            default:
                emoj = "";
        }
        return emoj;
    };

    onAddEmoji(emoji) {
        console.debug("addedemoji=" + JSON.stringify(emoji));
        const newValue = this.state.value + emoji.native;
        this.setState({
            showEmojis: false,
            value: newValue
        });
        this.props.valueAttribute.setValue(newValue);
    }

    handleClickOutside(event) {
        if (this.emojiRef && !this.emojiRef.current?.contains(event.target)) {
            this.setState({ showEmojis: false });
        }
    }

    render() {
        const {
            renderMode,
            allowSpaceInQuery,
            allowSuggestionsAboveCursor,
            mentionTrigger,
            autoFocusSearch,
            emojiPickerTheme,
            emojiTopbarColor,
            emojiEnabled,
            onEnterAction
        } = this.props;
        // check rendermode
        let singleLine = false;
        if (renderMode === "textbox") {
            singleLine = true;
        }

        if (this.state.readOnly) {
            return (
                <div ref={this.nodeRef} className="mx-widget-mentions mx-widget-mentions-readonly">
                    <MentionsInput value={this.state.value} singleLine={singleLine} className="mentions">
                        <Mention className="mentions__mention" displayTransform={this.displayTransform} />
                    </MentionsInput>
                </div>
            );
        } else {
            return (
                <div ref={this.nodeRef} className="mx-widget-mentions">
                    <MentionsInput
                        value={this.state.value}
                        singleLine={singleLine}
                        onChange={this.onChangeValue}
                        onBlur={this.onLeaveHandler}
                        onFocus={onEnterAction}
                        placeholder={this.placeholder}
                        allowSpaceInQuery={allowSpaceInQuery}
                        className="mentions"
                        allowSuggestionsAboveCursor={allowSuggestionsAboveCursor}
                    >
                        <Mention
                            trigger={mentionTrigger}
                            data={this.state.data}
                            renderSuggestion={this.suggestionItem}
                            onAdd={this.onAddMentionHandler}
                            className="mentions__mention"
                            displayTransform={this.displayTransform}
                        />
                    </MentionsInput>
                    {this.state.showEmojis ? (
                        <span ref={this.emojiRef} className={"emoji__picker"}>
                            <NimblePicker
                                onSelect={this.onAddEmojiHandler}
                                showSkinTones={false}
                                sheetSize={32}
                                data={emojidata}
                                showPreview={false}
                                native={true}
                                theme={emojiPickerTheme}
                                autoFocus={autoFocusSearch}
                                color={emojiTopbarColor}
                            />
                        </span>
                    ) : null}
                    {emojiEnabled ? (
                        <button className={"emoji__button"} onClick={() => this.setState({ showEmojis: true })}>
                            {String.fromCodePoint(0x1f642)}
                        </button>
                    ) : null}
                </div>
            );
        }
    }
}
