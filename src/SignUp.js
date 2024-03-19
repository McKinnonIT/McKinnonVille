function openSignupForm(event) {
    var joinCard = {
        cardsV2: [
            {
                cardId: 'addContact',
                card: {
                    header: {
                        title: 'McKinnonVille',
                        subtitle: '2024',
                        imageUrl:
                            'https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Double%20Storey.png',
                        imageType: 'CIRCLE',
                    },
                    sections: [
                        {
                            header: '',
                            collapsible: true,
                            uncollapsibleWidgetsCount: 1,
                            widgets: [
                                {
                                    buttonList: {
                                        buttons: [
                                            {
                                                text: 'Click here to join',
                                                color: {
                                                    red: 0,
                                                    green: 0,
                                                    blue: 1,
                                                    alpha: 1,
                                                },
                                                onClick: {
                                                    action: {
                                                        function: 'signUpClick',
                                                        parameters: [
                                                            {
                                                                key: 'user',
                                                                value: event,
                                                            },
                                                        ],
                                                        interaction: 'CARD_CLICKED',
                                                    },
                                                },
                                                disabled: false,
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
    return joinCard
}

function signUp(name, email, userId, spaceId) {
    var citizens = getCitizens();
    var availablePlots = getAvailablePlots();
    var randomIndex = Math.floor(Math.random() * availablePlots.length);
    var randomPlot = availablePlots[randomIndex];

    var allowMultipleSignups = [
        "sam.neal@mckinnonsc.vic.edu.au",
        "blake@mckinnonsc.vic.edu.au"
    ]
    if (citizens.includes(email) && !allowMultipleSignups.includes(email)) {
        return { text: `You (${email}) are already playing!` };
    }

    appendRow([name, email, randomPlot, userId, spaceId, ...Array(4).fill(null), ...Array(13).fill(1)]);
    allocatePlot(randomPlot)
    return {
        cardsV2: [
            {
                cardId: 'addContact',
                card: {
                    "header": {
                        "title": `Welcome to McKinnonVille, ${name}`,
                        "subtitle": `You have been given the plot ${randomPlot}.`,
                        "imageUrl": "https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Tent.png",
                        "imageType": "SQUARE"
                    },
                    sections: [
                        {

                        },
                    ],
                },
            },
        ]
    }
}

