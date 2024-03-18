function testFunc() {
    return null
}

function testMultiSelect() {
    return {
        cardsV2: [
            {
                cardId: 'avatarCard',
                card: {
                    name: 'Avatar Card',
                    header: 'header',
                    sections: [
                        {
                            header: 'Select contacts',
                            widgets: [
                                {
                                    selectionInput: {
                                        type: 'MULTI_SELECT',
                                        label: 'Selected contacts',
                                        name: 'contacts',
                                        multiSelectMaxSelectedItems: 3,
                                        multiSelectMinQueryLength: 1,
                                        items: [
                                            {
                                                value: 'contact-1',
                                                startIconUri:
                                                    'https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png',
                                                text: 'Contact 1',
                                                bottomText: 'Contact one description',
                                                selected: false,
                                            },
                                            {
                                                value: 'contact-2',
                                                startIconUri:
                                                    'https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png',
                                                text: 'Contact 2',
                                                bottomText: 'Contact two description',
                                                selected: false,
                                            },
                                            {
                                                value: 'contact-3',
                                                startIconUri:
                                                    'https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png',
                                                text: 'Contact 3',
                                                bottomText: 'Contact three description',
                                                selected: false,
                                            },
                                            {
                                                value: 'contact-4',
                                                startIconUri:
                                                    'https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png',
                                                text: 'Contact 4',
                                                bottomText: 'Contact four description',
                                                selected: false,
                                            },
                                            {
                                                value: 'contact-5',
                                                startIconUri:
                                                    'https://www.gstatic.com/images/branding/product/2x/contacts_48dp.png',
                                                text: 'Contact 5',
                                                bottomText: 'Contact five description',
                                                selected: false,
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        ],
    };
}
