const invoice = [
  {
    id: 'd8ba471c-d279-4c36-9eef-7bc2e56c94d1',
    type: 'h1',
    value: '[Rechnungsnummer]',
    class: 'codelos-header-one-block',
  },
  {
    id: 'fb3d2e2c-e18f-4150-b2b3-202f77273ccd',
    type: 'hr',
    value: '\n\n\n',
    class: 'codelos-hr-block',
  },
  {
    id: '58a0d69b-9b8c-4995-a2e7-fa95b733497d',
    type: 'col',
    class: 'codelos-col-list-block',
    elements: [
      {
        id: '71f09d57-ba54-44cf-a036-0209f54258a8',
        type: 'col-sub',
        class: 'codelos-col-block',
        children: [
          {
            id: '1c2a064a-0edf-41eb-8e03-0dbd821fc0aa',
            type: 'h2',
            value: '[Rechnung an:]',
            class: 'codelos-header-two-block',
          },
          {
            id: '2bcea64c-4a06-4016-a37a-210c1ccc8e1e',
            type: 'input',
            value: '[Name]',
            placeHolder: "Drücken Sie '/' für Befehle ...",
            class: 'codelos-text-block',
          },
          {
            id: 'a5dcaa05-fc81-4cad-bb8b-cb966df0adf7',
            type: 'input',
            value: '[Adresse]',
            placeHolder: "Drücken Sie '/' für Befehle ...",
            class: 'codelos-text-block',
          },
          {
            id: '98ac1bf0-4eed-43fb-9a11-eda43716095d',
            type: 'input',
            value: '[Stadt]',
            placeHolder: "Drücken Sie '/' für Befehle ...",
            class: 'codelos-text-block',
          },
        ],
      },
      {
        id: 'ce140c1d-9bb5-4ab4-9a6f-6a3e3bc86f66',
        type: 'col-sub',
        class: 'codelos-col-block',
        children: [],
      },
    ],
  },
  {
    id: '4289e215-5a0f-424c-ab4b-f67dd11a8641',
    type: 'table',
    value: {
      rows: 3,
      cols: 4,
      content: [
        ['Produkt', 'Menge', 'Preis', 'Gesamtpreis'],
        ['item1', '2', '100', '200'],
        ['item2', '1', '100', '100'],
      ],
      tableString: null,
      hasHeader: false,
      isShowHeading: true,
      headingContent: 'Zahlungsinformationen',
      isFullWidth: true,
      boldRows: [false, false, false],
    },
    class: 'codelos-table-block',
  },
  {
    id: 'a1f1ec24-d1d3-42a8-8d44-455c06feb539',
    type: 'col',
    class: 'codelos-col-list-block',
    elements: [
      {
        id: '58f4d55b-5194-4d4d-9e42-e8d2c9632376',
        type: 'col-sub',
        class: 'codelos-col-block',
        children: [],
      },
      {
        id: '766d805c-6484-44d1-9046-32d798a20ca0',
        type: 'col-sub',
        class: 'codelos-col-block',
        children: [],
      },
      {
        id: '4cd992dd-7422-4eaa-9295-a46caa304acd',
        type: 'col-sub',
        class: 'codelos-col-block',
        children: [
          {
            id: 'cb0cc863-d43d-4520-a612-b34072eab0c2',
            type: 'h3',
            value: 'Gesamtbetrag',
            class: 'codelos-header-three-block',
          },
        ],
      },
      {
        id: '8ba7893a-d4e8-471f-a473-1ea1ce700ed6',
        type: 'col-sub',
        class: 'codelos-col-block',
        children: [
          {
            id: '0e421f30-b35c-4f36-ab1a-64f6cdd88346',
            type: 'h3',
            value: '300',
            class: 'codelos-header-three-block',
          },
        ],
      },
    ],
  },
];

const table = [
  {
    id: 'bb221113-5ff1-4c62-80b4-fdaf46100ec9',
    type: 'table',
    value: {
      rows: 2,
      cols: 2,
      content: [
        ['', ''],
        ['', ''],
      ],
      tableString: null,
      hasHeader: false,
      isShowHeading: false,
      headingContent: null,
      isFullWidth: true,
      boldRows: new Array(2).fill(false),
    },
    class: 'codelos-table-block',
  },
];

const angebot = [
  {
    id: 'e0470b5c-f081-4c14-8221-edcf9fa558d2',
    type: 'col',
    class: 'codelos-col-list-block',
    elements: [
      {
        id: '4888e7ad-f8f8-4ae5-b154-cf25910a40f5',
        type: 'col-sub',
        class: 'codelos-col-block',
        children: [
          {
            id: '609a775a-84bc-4b7e-84f1-2f2057870de0',
            type: 'h2',
            value: '[Dein Firmenname]',
            class: 'codelos-header-two-block',
          },
          {
            id: '184b31c6-f162-473f-84b9-aa263730e84f',
            type: 'input',
            value: '[Adresse]',
            class: 'codelos-text-block',
            placeHolder: "Drücken Sie '/' für Befehle ...",
          },
          {
            id: 'ac998ed3-e17a-4eb8-8cfb-8a9f92126f3e',
            type: 'input',
            value: '[City]',
            class: 'codelos-text-block',
            placeHolder: "Drücken Sie '/' für Befehle ...",
          },
          {
            id: '87316ae7-fe77-4aaa-969f-2c6feaec6b23',
            type: 'input',
            value: null,
            class: 'codelos-text-block',
            placeHolder: "Drücken Sie '/' für Befehle ...",
          },
        ],
      },
      {
        id: 'fc2c662f-3f2e-441f-a746-9a3cc4d80966',
        type: 'col-sub',
        class: 'codelos-col-block',
        children: [
          {
            id: 'a0325ece-9707-4b2c-aa6b-4bdfecd8949b',
            type: 'h1',
            value: '[Kunde]',
            class: 'codelos-header-one-block',
          },
          {
            id: '9cad6946-d9de-4139-bca1-8493a782d270',
            type: 'input',
            value: 'Adresse',
            class: 'codelos-text-block',
            placeHolder: "Drücken Sie '/' für Befehle ...",
          },
          {
            id: '15f152fc-3950-4c92-9a82-8deac92eca46',
            type: 'input',
            value: 'City',
            class: 'codelos-text-block',
            placeHolder: "Drücken Sie '/' für Befehle ...",
          },
        ],
      },
    ],
  },
  {
    id: '6556c0bd-5dad-48a5-8283-d4aaa55d3893',
    type: 'hr',
    value: null,
    class: 'codelos-hr-block',
  },
  {
    id: '47f9dfb6-9d96-4ea3-8337-a846f992d5af',
    type: 'h2',
    value: 'Angebot für die Errichtung von Ladeinfrastruktur (Wallbox)',
    class: 'codelos-header-two-block',
  },
  {
    id: 'c1c1a89c-5c54-4229-ba54-e4e05f17bce9',
    type: 'input',
    value: 'Stellplatz der Liegenschaft: Lerchenauer Straße 6 6',
    class: 'codelos-text-block',
    placeHolder: "Drücken Sie '/' für Befehle ...",
  },
  {
    id: 'f2afbfbc-031c-41b4-8319-dabb237b2590',
    type: 'hr',
    value: null,
    class: 'codelos-hr-block',
  },
  {
    id: 'd0bfbc2a-1983-4ab1-98c3-4d749a4313ae',
    type: 'input',
    value: 'Sehr geehrter Herr [Kunde]',
    class: 'codelos-text-block',
    placeHolder: "Drücken Sie '/' für Befehle ...",
  },
  {
    id: '32f37300-e650-47fa-a063-7bef5234e38b',
    type: 'input',
    value:
      'vielen Dank für Ihre Anfrage. Im Folgenden finden Sie hierzu das Angebot',
    class: 'codelos-text-block',
    placeHolder: "Drücken Sie '/' für Befehle ...",
  },
  {
    id: 'b7e3ca2e-5d9f-46c1-a79e-a9f898019818',
    type: 'table',
    value: {
      hasHeader: false,
      boldRows: [true, false, false],
      isShowHeading: false,
      headingContent: null,
      tableString: null,
      rows: 3,
      cols: 3,
      content: [
        ['Bezeichnung', 'Menge', 'Preis'],
        ['Item', '1', '1'],
        ['', 'Summe', '1'],
      ],
      isFullWidth: true,
    },
    class: 'codelos-table-block',
  },
  {
    id: '30f7a1ba-bf04-4371-8017-e193f619f6e2',
    type: 'input',
    value:
      'Für zusätzliche oder unvorhersehbare Leistungen sowie besondere Installationswünsche, welche im Angebot nicht berücksichtigt wurden, stellen wir dem Kunden den Mehraufwand in Form von Material nach Verbrauch und Arbeitszeit separat in Rechnung.',
    class: 'codelos-text-block',
    placeHolder: "Drücken Sie '/' für Befehle ...",
  },
];

export { invoice, table, angebot };
