function sendCareerSelectionCard() {
    return {
        cardsV2: [
            {
                cardId: 'careerSelection',
                card: {
                    name: 'Select your career',
                    header: {
                        "title": "Career Selection",
                    },
                    sections: [
                        {
                            header: 'Select your career',
                            widgets: [
                                {
                                    selectionInput: {
                                        type: 'DROPDOWN',
                                        label: 'Contact type',
                                        name: 'contactType',
                                        items: [
                                            {
                                                text: 'Work',
                                                value: 'Work',
                                                selected: false,
                                            },
                                            {
                                                text: 'Personal',
                                                value: 'Personal',
                                                selected: false,
                                            },
                                            // Adding the specified careers as items
                                            { text: 'Teacher', value: 'Teacher', selected: false, startIconUri: 'https://developers.google.com/chat/images/quickstart-app-avatar.png' },
                                            { text: 'Doctor', value: 'Doctor', selected: false },
                                            { text: 'Musician', value: 'Musician', selected: false },
                                            { text: 'Visual Artist', value: 'VisualArtist', selected: false },
                                            { text: 'Psychologist', value: 'Psychologist', selected: false },
                                            { text: 'Athlete', value: 'Athlete', selected: false },
                                            { text: 'Scientist', value: 'Scientist', selected: false },
                                            { text: 'Chef', value: 'Chef', selected: false },
                                            { text: 'Journalist', value: 'Journalist', selected: false },
                                            { text: 'Pharmacist', value: 'Pharmacist', selected: false },
                                            { text: 'Lawyer', value: 'Lawyer', selected: false },
                                            { text: 'Software Developer', value: 'SoftwareDeveloper', selected: false },
                                            { text: 'Engineer', value: 'Engineer', selected: false },
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
