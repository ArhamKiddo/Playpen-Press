import { Article } from "./types";

export const INITIAL_ARTICLES: Article[] = [
  {
    id: "featured-1",
    headline: "The Green Canopy Project: Our School Commits to 100% Carbon-Neutral Campus by 2030",
    subheading: "A student-led movement prompts the board of education to pass a sweeping sustainability initiative.",
    byline: "Maya Lin, Editor-in-Chief",
    date: "May 24, 2026",
    category: "Campus Life (Opinions)",
    paragraphs: [
      "In a historic 5-2 vote on Tuesday night, the School District Governing Board officially ratified the Green Canopy Charter, an aggressive, student-authored mandate pledging to convert our entire campus infrastructure to 100% renewable energy and carbon-neutral operations by the dawn of the next decade.",
      "The victory comes after eight months of continuous advocacy, petition drives, and comprehensive research conducted by the student-led Environmental Action Coalition (EAC). EAC members presented a 46-page proposal outlining immediate, cost-effective adjustments, including building-mounted solar panel fields, localized composting grids, and a smart LED lighting system across all learning spaces.",
      "\"This isn't just a symbolic gesture of policy; it's a real, legally-binding timeline,\" declared Maya Alvarez, a sophomore and founding chairperson of the EAC. \"We proved to the administration that investing in green heating-ventilation-air-conditioning systems will actually save the district more than $140,000 annually over the next twelve years. We forced them to look at the numbers and realize that the future of this school is both our responsibility and theirs.\"",
      "The initial phase of the Green Canopy Project, set to kick off this upcoming autumn, will focus on replacing the main library's outdated roof configuration with a modern, garden-covered model that provides superior thermal insulation while capturing rainwater. A solar panel canopy is also scheduled for construction over the main faculty parking lot.",
      "While some community residents raised concerns during the public comment section of the meeting regarding upfront capital costs, student leaders successfully lobbied two local green technology grants to subsidize more than forty percent of the initial setup expenditure. The board agreed that the long-term operational savings made this an undeniable long-term investment.",
      "Principal David Vance expressed high admiration for the students' absolute professionalism and commitment. \"They didn't just walk into my office to complain about global warming. They walked in with engineers, budget tables, and draft blueprints. They proved that youth journalism and student voice have the power to fundamentally change policy.\""
    ],
    imageUrl: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&q=80&w=1200",
    readTime: "5 min read",
    isFeatured: true
  },
  {
    id: "sports-1",
    headline: "The Great Comeback: Phantoms Clinch State Championship in Triple-Overtime Thriller",
    subheading: "A buzzer-beating three-pointer drafts athletic history in one of the most exciting finals games of the decade.",
    byline: "Marcus Vance, Sports Editor",
    date: "May 25, 2026",
    category: "Phantoms Sports",
    paragraphs: [
      "In a contest that will be spoken of in gymnasium corridors for generations to come, our varsity Phantoms secured the state division title last Friday night, defeating the heavily-favored Central Heights Titans 84-82 in an incredible triple-overtime epic.",
      "Trailing by eleven points with less than three minutes remaining in the fourth quarter, the Phantoms seemed entirely out of steam. However, a defensive press engineered by sophomore guard Leo Chen forced four consecutive turnovers, triggering a blistering 12-1 run that tied the game at 68 with only nine seconds left on the game clock.",
      "As the crowd of nearly two thousand roaring spectators watched in absolute silence, Chen drove down the left wing, rose up over two towering defenders, and released a high-arching shot that kissed the back of the rim and fell through matching the final horn.",
      "\"We never looked at the scoreboard. We only looked at each other,\" an exhausted Chen smiled post-game, doused in celebratory water. \"Coach kept telling us in the huddles that champions aren't defined by how they start, but by how they handle the fourth quarter. We knew if we stayed together, we had them.\"",
      "The win marks our athletic division's first state championship trophy since 2011, breaking a long fifteen-year drought and cementing this team's absolute legacy in our school's hall of fame."
    ],
    imageUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800",
    readTime: "4 min read"
  },
  {
    id: "opinion-1",
    headline: "The Screen Trap: Why We Need Fully Screen-Free Lunches",
    subheading: "Relearning the lost school art of real-life conversation, or why our smartphones are secretly starving our friendships.",
    byline: "Sarah Jenkins, Class of '27",
    date: "May 26, 2026",
    category: "Campus Life (Opinions)",
    paragraphs: [
      "Walk into the student cafeteria on any given afternoon and you will notice a bizarre, quiet phenomenon: fifteen tables of students sitting together in physical proximity, yet entirely insulated in individual digital bubbles, fingers flicking through five-second videos.",
      "The cafeteria was once the loud, chaotic laboratory where school culture was bred—where arguments about music occurred, where inside jokes were born, and where we learned the basic human social skill of making small talk with people we barely knew.",
      "By retreating into our screens, we are avoiding the slight discomfort of physical social interactions. It is time to establish a 'Screen-Free Table' policy — simple, voluntary zones where students commit to putting their phones inside their backpacks to foster real, eye-to-eye human conversation."
    ],
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    readTime: "3 min read"
  },
  {
    id: "arts-1",
    headline: "Behind the Curtains: 'Into the Woods' Cast Redefines the School Musical",
    subheading: "The theater department's bold adaptation explores complex themes of adulthood and consequences.",
    byline: "Chloe Dupoint, Arts Critic",
    date: "May 22, 2026",
    category: "Events and Clubs",
    paragraphs: [
      "This year's ambitious performance of Stephen Sondheim's masterpiece, 'Into the Woods,' wasn't just another lighthearted school play—it was a dark, emotionally mature, and stunningly acted investigation of wishes, family, and the heavy price of getting what you want.",
      "With a minimalist, hand-painted wooden stage design and a live student orchestra that masterfully navigated Sondheim's famously difficult musical keys, the show held the audience spellbound from the Baker's opening song to the final, emotional chorus of 'Children Will Listen.'",
      "Special credit goes to senior Clara Cruz, whose portrayal of the Witch brought a perfect balance of chilling menace and tragic heartbreak, making this production a true triumph of student art."
    ],
    imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800",
    readTime: "3 min read"
  },
  {
    id: "tech-1",
    headline: "Junior Builds High-Precision Weather Lab on School Greenhouse Roof",
    subheading: "Utilizing microcontrollers and solar arrays, Julian Thorne brings real-time environmental data to science classes.",
    byline: "Elena Kovalenko, Science Correspondent",
    date: "May 20, 2026",
    category: "Studies",
    paragraphs: [
      "While most students spent spring break relaxing, junior Julian Thorne was climbing ladders. Armed with an array of wind sensors, temperature probes, an Arduino processor, and a custom solar charger, Thorne successfully built and booted a real-time meteorological weather station on the school greenhouse roof.",
      "Dubbed the 'Campus SkyWatcher,' the station broadcasts precise atmospheric measurements to a digital dashboard that science instructors can use to teach real-life thermodynamics and environmental science.",
      "\"I wanted our science labs to use actual active data from our exact location, rather than generic regional averages,\" Julian explained. \"Now, if a storm rolls in during fourth period, teacher can pull up our live pressure and humidity readings in real time.\""
    ],
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=800",
    readTime: "4 min read"
  }
];
