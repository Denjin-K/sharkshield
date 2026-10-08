/**
 * EEA 2026 talks the project is following, from the repo README.
 * Structured data lives here rather than in MDX so the page can render
 * each row as a card. Results are as reported in the conference abstracts.
 * Times are Japan Standard Time.
 */

export type Talk = {
  /** Time in JST, with the day where the session spans more than one. */
  time: string;
  speaker: string;
  affiliation?: string;
  title: string;
  /** "What we took from it". */
  takeaway: string;
};

export type Session = {
  id: string;
  title: string;
  /** Session name and day, where the booklet gives one. */
  note?: string;
  talks: Talk[];
};

export type Reference = {
  label: string;
  href: string;
  note: string;
};

export const conference = {
  name: "European Elasmobranch Association conference, EEA 2026",
  dates: "6–8 October 2026",
  /** Wording stays "following" until the talks have been heard. */
  framing:
    "Abstracts we are following from EEA 2026. Times are in Japan Standard Time. Results are as reported in the conference abstracts.",
  takeawayLabel: "What we took from it",
  sessionsTitle: "The talks",
  referencesTitle: "References",
};

export const sessions: Session[] = [
  {
    id: "depredation",
    title: "Depredation and human–shark conflict",
    note: "Session “Living with Sharks”, Wednesday 7 October.",
    talks: [
      {
        time: "17:05",
        speaker: "Jonathan Mitchell",
        affiliation: "University of Western Australia",
        title: "Shark depredation: a growing human-wildlife conflict threatening shark conservation",
        takeaway:
          "A review of ten years of depredation research, mostly from Australia and the USA. Two electrical deterrent devices tested in Australia cut depredation rates by about 60%. Larger trials and cheaper, more practical designs are still needed.",
      },
      {
        time: "17:15",
        speaker: "Victoria Camilieri-Asch",
        affiliation: "University of Western Australia",
        title:
          "Finding a path to coexistence between fishers and sharks in the deepwater line fishery at Cocos Keeling Islands (Australia) using a new deterrent device",
        takeaway:
          "A randomised trial of the RPELX deterrent over 51 fishing sessions, designed together with local fishers. The device lowered the probability of a depredation event by 63% and also reduced shark bycatch and gear loss. Grey reef sharks were the main species involved.",
      },
      {
        time: "17:25",
        speaker: "Paolo Cappa",
        affiliation: "Swansea University",
        title:
          "Using big data analytics to assess SMART drumlines as an ecologically appropriate fishery strategy for shark bite management",
        takeaway:
          "SMART drumlines in La Réunion and New South Wales were selective for the target shark species, and most animals were alive when the gear was retrieved. Sea surface temperature explained catches most consistently.",
      },
      {
        time: "17:35",
        speaker: "Eleonora de Sabata",
        title:
          "Living Together: the LIFE European Sharks approach to elasmobranch conservation in the Mediterranean Sea — the case of Mustelus spp.",
        takeaway:
          "A coexistence programme built on voluntary measures: a minimum landing size trialled by professional fishers, catch-and-release among recreational fishers, and guidance for consumers.",
      },
    ],
  },
  {
    id: "deterrents",
    title: "Deterrents and bycatch mitigation",
    talks: [
      {
        time: "Tue 6 Oct, 22:55",
        speaker: "Giovanna Bergamin",
        affiliation: "University of Padova",
        title:
          "Effectiveness of bycatch mitigation devices in reducing captures of elasmobranchs in small-scale fisheries in the Amvrakikos Gulf, Greece",
        takeaway:
          "In trammel nets targeting prawns, green flashing LEDs cut elasmobranch bycatch by 75% without reducing the target catch. Permanent magnets did the opposite and increased bycatch.",
      },
      {
        time: "Tue 6 Oct, 23:05",
        speaker: "Robert Enever",
        affiliation: "Fishtek Marine",
        title: "SharkGuard: Advances in Electric Pulse Deterrent technology",
        takeaway:
          "A trial on tuna longliners in New Caledonia. With the device 60 cm above the hook, shark bycatch fell by 46.6% with no significant loss of target catch. At 40 cm it fell by 88.7%, but target catch dropped by 19.4%.",
      },
      {
        time: "Thu 8 Oct, 17:20",
        speaker: "Laurence Fauconnet",
        affiliation: "University of the Azores",
        title:
          "Shedding light in the deep sea: an effective bycatch avoidance measure for elasmobranchs in bottom longline fisheries?",
        takeaway:
          "Lights of four colours were tested at different depths in the Azores. Deep-water sharks and rays responded to light differently from bony fish, and the effect depended on colour and species.",
      },
      {
        time: "Thu 8 Oct, 17:40",
        speaker: "Leonor Mendonça",
        affiliation: "University of the Azores",
        title:
          "Incorporating fishers' knowledge into vulnerability assessments of two data-poor deep-sea shark species to the bottom longline fishery in the Azores",
        takeaway:
          "Workshops with fishers corrected assumptions about fishing depth, season and effort. Those corrections changed the outcome of the vulnerability assessment.",
      },
    ],
  },
];

export const references: Reference[] = [
  {
    label: "EEA 2026 abstract booklet",
    href: "https://issuu.com/sharktrust/docs/eea_2026_abstract_booklet",
    note: "Published by the Shark Trust on Issuu.",
  },
  {
    label: "Fishery guide: seabirds (PDF)",
    href: "https://github.com/Denjin-K/sharkshield/blob/main/research/FisheryGuide_seabirds_English.pdf",
    note: "Mitigation guide kept in the project repository.",
  },
];
