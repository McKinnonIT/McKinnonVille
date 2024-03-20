function signUpDialog() {
    return {
        "action_response": {
            "type": "DIALOG",
            "dialog_action": {
                "dialog": {
                    "body": {
                        "header": {
                            "title": "McKinnonVille",
                            "subtitle": "How to play",
                            "imageUrl": "https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Double%20Storey.png",
                            "imageType": "CIRCLE"
                        },
                        "sections": [
                            {
                                "header": "",
                                "collapsible": false,
                                "uncollapsibleWidgetsCount": 1,
                                "widgets": [
                                    {
                                        "textParagraph": {
                                            "text": "<a href=https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Double%20Storey.png>Click here for map</a><br /><br />Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut sit amet dolor pretium turpis eleifend aliquet. Sed at metus blandit, cursus nisi sit amet, pellentesque nunc. Etiam quis suscipit lectus. Pellentesque vel orci posuere, feugiat ex et, ullamcorper eros. Maecenas magna sem, ultricies eget mauris vel, aliquet blandit neque. Nunc ante nibh, semper et blandit eget, volutpat et quam. Nunc eu maximus dolor, vel interdum tortor. Donec bibendum nibh nec est tristique semper. Nunc facilisis libero vitae vestibulum interdum."
                                        }
                                    },
                                    {
                                        "buttonList": {
                                            "buttons": [
                                                {
                                                    "text": "Sign up",
                                                    "icon": {
                                                        "knownIcon": "VIDEO_PLAY",
                                                    },
                                                    "onClick": {
                                                        "action": {
                                                            "function": "handleSendOccupationDialog",
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        }
    };
}


function signUp(name, email, userId, spaceId, house, occupation) {
    var citizens = getCitizens();
    var availablePlots = getAvailablePlots();
    var randomIndex = Math.floor(Math.random() * availablePlots.length);
    var randomPlot = availablePlots[randomIndex];

    // Check if email is already registered
    if (citizens.includes(email) && !DEV_USERS.includes(email)) {
        return { text: `You (${email}) are already playing!` };
    }

    // Check if there are available plots
    if (availablePlots.length === 0) {
        return { text: `Sorry, there are no available plots at the moment.` };
    }

    // Check if all required parameters are provided
    if (!name || !email || !userId || !spaceId || !house || !occupation) {
        return { text: `Information missing, please email help@mckinnonsc.vic.edu.au for help.` };
    }

    appendRow([name, email, randomPlot, userId, spaceId, house, ...Array(2).fill(null), occupation, ...Array(13).fill(1)]);
    allocatePlot(randomPlot);

    return {
        cardsV2: [
            {
                cardId: 'addContact',
                card: {
                    header: {
                        title: `Welcome to McKinnonVille, ${name}`,
                        subtitle: `You have been given the plot ${randomPlot}.`,
                        imageUrl: "https://raw.githubusercontent.com/McKinnonIT/McKinnonVille/main/assets/img/Tent.png",
                        imageType: "SQUARE"
                    },
                    sections: [
                        {
                            header: 'Select your occupation',
                            widgets: [
                                {
                                    selectionInput: {
                                        type: 'DROPDOWN',
                                        label: 'Occupations',
                                        name: 'occupations',
                                        items: getOccupationItems(getOccupations()),
                                        onChangeAction: {
                                            function: 'handleOccupationSelection',
                                        },
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        ]
    };
}

