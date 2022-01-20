## MentionInputWidget
Textbox/Textarea widget for mentioning/Tagging someone or something in the textarea itself based on a dropdown. Like when using @ in Slack or Teams.

## Features
- Trigger suggestiondropdown based on trigger symbol (e.g '@')
- Supply the suggestions data and list content yourself
- Actions for adding and removing mentions
- Optional emoji picker
- Multiple minor customizable settings

## Installation
- Add widget to your page
- Supply the text attribute you want to use for the input
- Supply the list for the mentionlist and set the label attribute

## Usage
The suggestionlist content:
You have to develop how you want the dropdown to look yourself, you do this by adding Mendix widgets to the available content container inside the widget itself. Each item in the list will render with exactly what you put in there. You can for example add a profile image this way (see demo example).

Mention events:
The onAdd and onRemove mention events should be used to apply custom business logic based on what people have mentioned in the text. For example you can add or remove an association based on these events. Each of these events recieve the object that was selected in the list and you have to manually add this as a parameter to the microflow/nanoflow you have selected for the event.

Emoji's:
There is also an optional feature to add an emoji picker to the Textbox/Textarea. This picker uses native icons, so for example on an iPhone it will render the Apple's version of the emoji's. It also will allow you to automatically convert common smileys to emoji. (like :D for example).

Styling:
The widget itself will render 2 different div's on top of eachother so that we can style how the mentioned item will look inside the text. The div with the class "mentions__highlighter" is the topmost div and holds the display of the mention, the div with the class "mentions__input" holds the actual textvalue that you type. you can add custom styling to these classes yourself. The suggestionlist dropdown also has some base classes, "mentions__suggestions__list", "mentions__suggestions__item" and "mentions__suggestions__item--focused". You can set the hover color by changing the background color styling of the "mentions__suggestions__item--focused" class for example.

Read-only mode:
Because we need to save the ID of the object mentioned in the actual text you cannot just simply put the value in a text widget if you want to only view it. You can simply use the widget itself and set the editability to never, it will then render as text.

## Demo project
https://mentioninputwidget-sandbox.mxapps.io/

## Issues, suggestions and feature requests
https://github.com/hunterkoppenclevr/mention-input-widget