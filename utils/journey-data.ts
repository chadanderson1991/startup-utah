export interface JourneyLink {
  name: string
  url: string
  description?: string
}

export interface JourneySection {
  heading: string
  description: string
  links?: JourneyLink[]
}

export interface JourneyStep {
  step: number
  phase: number
  title: string
  goal: string
  themes: string[]
  topics: string[]
  sections: JourneySection[]
}

export const JOURNEY_PHASES = [
  { number: 1, label: 'Getting Started', steps: [1, 2, 3] },
  { number: 2, label: 'Build Your Business', steps: [4, 5, 6, 7, 8] },
  { number: 3, label: 'Launch & Fund', steps: [9, 10, 11, 12] },
  { number: 4, label: 'Scale & Grow', steps: [13, 14, 15, 16, 17] },
  { number: 5, label: 'Special Situations', steps: [18, 19] },
]

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    step: 1,
    phase: 1,
    title: 'Find Your Big Idea',
    goal: 'Identify and evaluate a business concept worth pursuing.',
    themes: ['Brainstorming', 'Self-assessment', 'Monetizing your passion'],
    topics: ['Start a Business', 'Entrepreneurship Communities'],
    sections: [
      {
        heading: 'Find Your Big Idea',
        description: 'How do you want to change the world? The first step in any entrepreneurial journey is identifying a business idea worth pursuing. Whether it comes from a passion, a problem you\'ve noticed, or a skill you want to monetize, Utah\'s local support network is here to help you evaluate and refine your concept.',
      },
      {
        heading: 'Brainstorming Ideas',
        description: 'Explore resources to help you evaluate business concepts before you commit. This includes identifying winning ideas, understanding market needs, and tapping into Utah\'s support networks for early-stage entrepreneurs.',
        links: [
          { name: 'Small Business Development Centers (SBDC Network)', url: 'https://utahsbdc.org/', description: 'Small Business Development Centers offer free 1:1 consulting to help you find the right business idea.' },
          { name: 'Startup Business Ideas: Four Steps to Identify the Right One', url: 'https://www.sba.gov/blog/startup-business-ideas-4-steps-identify-right-one', description: 'This resource can help you see if you\'re on the right track.' },
          { name: '8 Easy Businesses to Start', url: 'https://www.sba.gov/blog/8-easy-businesses-start', description: '8 business ideas from the SBA.' },
          { name: 'What Business Should I Start? 6 Factors to Help You Decide', url: 'https://www.uschamber.com/co/start/startup/deciding-what-business-to-start', description: 'An article from the U.S. Chamber of Commerce.' },
        ],
      },
      {
        heading: 'How to Monetize Your Passion',
        description: 'Turn what you love into a livelihood. Discover frameworks and resources for converting your passions, hobbies, or skills into profitable, sustainable business ventures.',
        links: [
          { name: 'How to Realistically Make Money from Your Passion', url: 'https://www.entrepreneur.com/leadership/how-to-realistically-make-money-from-your-passion/378275', description: 'Learn how to monetize the things you care about.' },
          { name: 'Learn Business Skills to Monetize Your Passion', url: 'https://www.linkedin.com/pulse/turn-your-passion-profession-learn-monetize-skill-create-ritu-negi', description: 'Learn skills like accounting, marketing, and sales to take your passion or hobby to the next level.' },
        ],
      },
    ],
  },
  {
    step: 2,
    phase: 1,
    title: 'Important Business Skills',
    goal: 'Build the foundational knowledge needed to run a business.',
    themes: ['Accounting basics', 'Marketing & sales', 'Hiring', 'Intellectual property'],
    topics: ['Start a Business'],
    sections: [
      {
        heading: 'Business Fundamentals',
        description: 'Build the organizational, strategic, and analytical foundations every business owner needs — from market analysis and risk management to understanding your business structure.',
        links: [
          { name: 'Entrepreneur Academy (SBDC)', url: 'https://utahsbdc.org/entrepreneur-academy/', description: 'The Entrepreneur Academy helps small businesses obtain online counseling, training, podcasts, webinars, and more.' },
          { name: 'SBDC Training Events', url: 'https://clients.utahsbdc.org/events.aspx', description: 'Small Business Development Centers offer free workshops and training to help small businesses learn skills like digital marketing, website creation, and business development.' },
          { name: 'SBA Learning Center', url: 'https://learn.sba.gov/dashboard', description: 'Access courses on planning, launching, managing, marketing, and growing your small business.' },
        ],
      },
      {
        heading: 'Accounting',
        description: 'Learn how to track finances, record transactions, prepare financial statements, and monitor cash flow. Strong accounting habits are critical from day one.',
        links: [
          { name: 'Tax and Accounting for Small Business', url: 'https://www.sbdcnet.org/small-business-information-center/tax-and-accounting-for-small-business/', description: 'Understand federal, state, and local tax and accounting requirements.' },
          { name: 'Manage Your Finances (SBA)', url: 'https://www.sba.gov/business-guide/manage-your-business/manage-your-finances', description: 'Learn about balance sheets, accounting methods, and how to get accounting help.' },
        ],
      },
      {
        heading: 'Sales and Marketing',
        description: 'Develop the skills to promote your products or services effectively and convert leads into loyal customers through strategic marketing and sales techniques.',
        links: [
          { name: 'Marketing and Sales (SBA)', url: 'https://www.sba.gov/business-guide/manage-your-business/marketing-sales', description: 'Learn marketing and sales basics like how to make a marketing plan, spread the word, and choose how you\'ll accept payments.' },
          { name: '10 Local Marketing Strategies That Work', url: 'https://www.sba.gov/blog/10-local-marketing-strategies-work', description: 'Learn how to attract prospects within your geographic area through local marketing.' },
        ],
      },
      {
        heading: 'Hire and Manage Employees',
        description: 'From writing job descriptions to understanding labor laws and running payroll, learn how to attract talent and build a high-performing team.',
        links: [
          { name: 'Hire and Manage Employees (SBA)', url: 'https://www.sba.gov/business-guide/manage-your-business/hire-manage-employees', description: 'Establish a basic payroll structure to help you hire employees. Then, manage employees properly with a general understanding of state and federal labor laws.' },
        ],
      },
      {
        heading: 'Personal Finance',
        description: 'Managing your personal finances alongside your business finances is essential. Understand how to maintain overall financial stability while investing in your startup.',
        links: [
          { name: 'Financial Checkup (Investopedia)', url: 'https://www.investopedia.com/personal-finance/how-conduct-financial-checkup/', description: 'Here\'s a simple system for assessing your fiscal fitness.' },
          { name: 'Financial Steps Before Starting a Business', url: 'https://www.northwesternmutual.com/life-and-money/financial-steps-to-take-before-starting-a-business/', description: 'These financial steps can help you set your business up for success.' },
          { name: 'Prepare Your Personal Finances', url: 'https://due.com/prepare-your-personal-finances-business-for-business-ownership/', description: 'An article discussing strategies to improve your personal finance.' },
        ],
      },
      {
        heading: 'Identify & Protect Intellectual Property',
        description: 'Your ideas have value. Learn the differences between copyrights, patents, trademarks, and trade secrets — and how to protect them before going to market.',
        links: [
          { name: 'USPTO — Protect Your IP', url: 'https://www.uspto.gov/', description: 'The USPTO is the federal agency for granting US patents and registering trademarks in the United States.' },
          { name: 'IP Identifier Tool (USPTO)', url: 'https://ipidentifier.uspto.gov/', description: 'The USPTO created an easy-to-use tool to help businesses identify their IP.' },
          { name: 'U.S. Copyright Office', url: 'https://copyright.gov/', description: 'The U.S. Copyright Office is the federal agency within the Library of Congress for registering copyrights.' },
          { name: 'Utah Trademark Registration', url: 'https://corporations.utah.gov/business-entities/trademark/', description: 'Register your trademark for protection in the state of Utah with the Utah Department of Commerce.' },
          { name: 'Patent and Trademark Resource Centers', url: 'https://www.uspto.gov/learning-and-resources/patent-trademark-resource-centers', description: 'Provides the public with various patent and trademark assistance.' },
        ],
      },
    ],
  },
  {
    step: 3,
    phase: 1,
    title: 'Business Validation',
    goal: 'Confirm real customer demand before investing heavily.',
    themes: ['Market research', 'Customer interviews', 'MVP testing', 'Competitive analysis'],
    topics: ['Start a Business'],
    sections: [
      {
        heading: 'Business Validation',
        description: 'Make sure there\'s a market for your business before you invest heavily. This step is about systematically testing your assumptions — through research, customer interviews, and real-world feedback — to confirm that people will actually pay for your product or service.',
      },
      {
        heading: 'Market Research',
        description: 'Gather and analyze information about your target market, customer preferences, industry trends, and competitors. Understanding your competitive landscape helps you position your business for success.',
        links: [
          { name: 'Market Research and Competitive Analysis (SBA)', url: 'https://www.sba.gov/business-guide/plan-your-business/market-research-competitive-analysis', description: 'Market research helps you find customers for your business. Competitive analysis helps you make your business unique.' },
        ],
      },
      {
        heading: 'Customer Validation',
        description: 'Get direct feedback from potential customers through surveys, interviews, focus groups, and social media. Real customer input is the best way to de-risk your concept and refine your offering before launch.',
        links: [
          { name: '5 Steps to Validate Your Business Idea (HBS)', url: 'https://online.hbs.edu/blog/post/market-validation', description: 'You\'ve come up with an innovative business idea — now it\'s time to validate your offering\'s market potential.' },
        ],
      },
    ],
  },
  {
    step: 4,
    phase: 2,
    title: 'Build Your Product or Service',
    goal: 'Develop a functional prototype or service offering.',
    themes: ['Prototyping', 'Manufacturing', 'IP protection', 'Product testing'],
    topics: ['Start a Business'],
    sections: [
      {
        heading: 'Build Your Product or Service',
        description: 'Develop your product or service with the help of Utah\'s resources and expert contacts. This step focuses on creating an offering that meets your target market\'s needs, iterating based on feedback, and building something customers will love.',
      },
      {
        heading: 'Develop Your Prototype',
        description: 'Find local prototyping facilities and connect with manufacturers to refine your design. Utah has resources specifically for early-stage product development, from physical prototyping to software MVPs.',
        links: [
          { name: 'Prototyping and Manufacturing Facilities (Southern Utah)', url: 'https://southernutahbusiness.org/business-resources/', description: 'Access prototyping and manufacturing facilities and local patent attorneys in Southern Utah.' },
        ],
      },
      {
        heading: 'Secure Intellectual Property Rights',
        description: 'Protect your unique ideas through patents, trademarks, copyrights, and trade secrets before bringing your product to market. IP protection is a key asset in your business\'s long-term value.',
        links: [
          { name: 'United States Patent & Trademark Office (USPTO)', url: 'https://www.uspto.gov/', description: 'The USPTO is the federal agency for granting US patents and registering trademarks in the United States.' },
          { name: 'U.S. Copyright Office', url: 'https://copyright.gov/', description: 'The U.S. Copyright Office is the federal agency within the Library of Congress for registering copyrights.' },
        ],
      },
      {
        heading: 'Product Testing',
        description: 'Evaluate your prototype through user feedback, surveys, and real-world testing. Rigorous testing helps you identify issues early and deliver a product your customers trust.',
        links: [
          { name: 'Product Testing: Examples and Tips (Shopify)', url: 'https://www.shopify.com/retail/product-testing', description: 'Learn the various product testing methods and tips to ensure your products meet the highest quality standards.' },
        ],
      },
    ],
  },
  {
    step: 5,
    phase: 2,
    title: 'Develop Your Brand & Marketing',
    goal: 'Establish your brand identity and plan to reach customers.',
    themes: ['Mission & vision', 'Logo & website', 'Social media', 'Trademark'],
    topics: ['Marketing and Sales', 'Start a Business'],
    sections: [
      {
        heading: 'Write Your Mission and Vision',
        description: 'Define your business\'s purpose and future direction. A strong mission and vision statement guides every decision you make and helps customers understand what you stand for.',
        links: [
          { name: 'Does Your Small Business Have a Strong Mission and Vision? (SCORE)', url: 'https://www.score.org/resource/blog-post/does-your-small-business-have-a-strong-mission-and-vision', description: 'Develop a clear mission, a well-articulated vision, and values that resonate with the customers you\'re trying to reach.' },
        ],
      },
      {
        heading: 'Design Your Visual Identity',
        description: 'Create a cohesive brand identity through fonts, logos, colors, and design elements. Protect your visual assets through trademarks and design patents to prevent competitors from copying your brand.',
        links: [
          { name: 'What Is a Trademark? (USPTO)', url: 'https://www.uspto.gov/trademarks/basics/what-trademark', description: 'Trademarks identify the source of your goods or services and provide legal protection for your brand.' },
          { name: 'USPTO Trademark Registration', url: 'https://www.uspto.gov/trademarks/basics' },
          { name: 'Utah Trademark Registration', url: 'https://corporations.utah.gov/business-entities/trademark/', description: 'Register your trademark for protection in the state of Utah with the Utah Department of Commerce.' },
          { name: 'Design Patents (USPTO)', url: 'https://www.uspto.gov/patents/basics/apply/design-patent', description: 'Design patents cover new, original, and ornamental designs for an article of manufacture.' },
        ],
      },
      {
        heading: 'Reserve Your Website URL and Social Media Channels',
        description: 'Secure your digital assets early. Research which social platforms your target audience uses and claim your handles before someone else does.',
        links: [
          { name: 'GoDaddy Domain Registration', url: 'https://www.godaddy.com/offers/brand/new', description: 'Buy and register your online domain name.' },
        ],
      },
      {
        heading: 'Build Your Website',
        description: 'Create an online home for your business where customers can learn about your offerings, engage with your brand, and make purchases. Your website is often the first impression you make.',
        links: [
          { name: 'WordPress', url: 'https://wordpress.org/' },
          { name: 'Squarespace', url: 'https://www.squarespace.com/' },
          { name: 'Wix', url: 'https://www.wix.com/' },
        ],
      },
    ],
  },
  {
    step: 6,
    phase: 2,
    title: 'Write Your Business Plan',
    goal: 'Create a roadmap that guides operations and attracts investors.',
    themes: ['Business plan formats', 'Value proposition', 'Financial projections'],
    topics: ['Start a Business', 'Funding'],
    sections: [
      {
        heading: 'Write Your Business Plan',
        description: 'Create a clear plan outlining your business goals, target market, and how you will achieve success. A business plan serves as both a roadmap for your operations and a tool for attracting investors and securing loans.',
      },
      {
        heading: 'Lean Business Plan',
        description: 'A streamlined, flexible approach that emphasizes the essential elements of your business. Lean plans are ideal for early-stage startups that need to move quickly and adapt as they learn from the market.',
        links: [
          { name: 'Fundamentals of Lean Business Planning (SBA)', url: 'https://www.sba.gov/blog/fundamentals-lean-business-planning', description: 'Learn about the four essential parts of a lean business plan.' },
        ],
      },
      {
        heading: 'Traditional Business Plan',
        description: 'A comprehensive document covering all aspects of your business — market analysis, financial projections, operations, and management structure. Essential for securing bank loans and major investor interest.',
        links: [
          { name: 'Write Your Business Plan (SBA)', url: 'https://www.sba.gov/business-guide/plan-your-business/write-your-business-plan', description: 'Your business plan is the foundation of your business. Learn how to write one quickly and efficiently.' },
        ],
      },
    ],
  },
  {
    step: 7,
    phase: 2,
    title: 'Registration & Licensure',
    goal: 'Legally establish and register your business with the state.',
    themes: ['LLC vs. corporation', 'FEIN registration', 'State registration', 'Professional licensing'],
    topics: ['Start a Business'],
    sections: [
      {
        heading: 'Legal Formation',
        description: 'Select the right business structure for your situation: corporation, LLC, sole proprietorship, or partnership. Each has different tax, liability, and operational implications that will affect your business long-term.',
        links: [
          { name: 'Select Your Business Structure (Utah.gov)', url: 'https://www.utah.gov/business/running/', description: 'Understand the types of organizational structures you can choose, including LLCs, corporations, sole proprietorships, and partnerships.' },
        ],
      },
      {
        heading: 'Federal Employer Identification Number (FEIN)',
        description: 'A FEIN is required for state registration and protects your personal Social Security Number. Apply for one through the IRS before completing your state registration.',
        links: [
          { name: 'How to Apply for an FEIN (IRS)', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/how-to-apply-for-an-ein', description: 'Applying for an Employer Identification Number (EIN) is a free service offered by the Internal Revenue Service.' },
        ],
      },
      {
        heading: 'State Business Registration',
        description: 'Utah\'s unified registration process lets you register with three state agencies simultaneously through a single online application — saving you time and simplifying your launch.',
        links: [
          { name: 'Utah Business Registration (OneStop)', url: 'https://businessregistration.utah.gov/', description: 'Utah\'s unified registration portal — register with three state agencies in a single application.' },
          { name: 'How to Register a Business', url: 'https://corporations.utah.gov/faqs/how-to-register-a-business/', description: 'Step-by-step guidance on registering your business with the Utah Division of Corporations.' },
        ],
      },
      {
        heading: 'Apply for Business Licenses',
        description: 'The licenses you need depend on your business type, location, and industry. Professional licenses are managed by the Division of Professional Licensing (DOPL), while local licenses vary by city or county.',
        links: [
          { name: 'Division of Professional Licensing (DOPL)', url: 'https://dopl.utah.gov/', description: 'Strengthening trust in Utah\'s professional workforce through effective licensing, balanced regulation, and consumer engagement.' },
          { name: 'Business Licensing Guide', url: 'https://corporations.utah.gov/2021/11/15/business-licensing/', description: 'After you register, get a business license from the city, town, or county where your business is located.' },
        ],
      },
    ],
  },
  {
    step: 8,
    phase: 2,
    title: 'Establish Business Operations',
    goal: 'Set up the systems needed to run a compliant business.',
    themes: ['Business bank account', 'Accounting software', 'HR basics', 'Business insurance'],
    topics: ['Start a Business', 'Taxes and Finance'],
    sections: [
      {
        heading: 'Set Up a Business Bank Account',
        description: 'Keep your personal and business finances completely separate from day one. A dedicated business account ensures accurate financial records, simplifies tax preparation, and builds credibility with vendors and clients.',
        links: [
          { name: 'Open a Business Bank Account (SBA)', url: 'https://www.sba.gov/business-guide/launch-your-business/open-business-bank-account', description: 'A business bank account helps you stay legally compliant and protected while providing benefits to your customers and employees.' },
        ],
      },
      {
        heading: 'Accounting and Record-keeping Systems',
        description: 'Track income and expenses, maintain receipts, and reconcile accounts regularly. Good record-keeping habits from the start make tax season easier and help you make informed business decisions.',
        links: [
          { name: 'Record Keeping 101 (SCORE)', url: 'https://www.score.org/philadelphia/resource/blog-post/recordkeeping-101-information-your-small-business-needs-maintain', description: 'Recordkeeping is part of the job when you\'re running a business — learn what information you need to maintain.' },
          { name: 'Why Record Keeping is Vital (SCORE)', url: 'https://www.score.org/resource/blog-post/why-recordkeeping-vital-and-how-do-it', description: 'The IRS requires you to keep books and records for your taxes, and various government agencies require records for employees.' },
        ],
      },
      {
        heading: 'Building a Team',
        description: 'Define roles clearly, recruit the right talent, and create a positive work environment from the start. This includes writing job descriptions, conducting interviews, and understanding your obligations as an employer.',
        links: [
          { name: 'Hire and Manage Employees (SBA)', url: 'https://www.sba.gov/business-guide/manage-your-business/hire-manage-employees', description: 'Establish a basic payroll structure to help you hire employees. Then, manage employees properly with a general understanding of state and federal labor laws.' },
        ],
      },
      {
        heading: 'Liability Insurance',
        description: 'Protect your business from legal and financial risks with appropriate insurance coverage. Business insurance can cover accidents, injuries, property damage, and professional liability — essential before you start serving customers.',
        links: [
          { name: 'Get Business Insurance (SBA)', url: 'https://www.sba.gov/business-guide/launch-your-business/get-business-insurance', description: 'Business insurance protects you from unexpected costs. Accidents, natural disasters, and lawsuits could run you out of business if you\'re not protected.' },
        ],
      },
    ],
  },
  {
    step: 9,
    phase: 3,
    title: 'Obtain Funding',
    goal: 'Secure capital to launch and operate your business.',
    themes: ['Grants', 'Crowdfunding', 'SBA loans', 'Angel investors', 'Venture capital'],
    topics: ['Funding'],
    sections: [
      {
        heading: 'Grants and Government Funding',
        description: 'Financial support you don\'t have to repay — but it requires a well-defined proposal and a demonstration of community benefit. Utah\'s Governor\'s Office of Economic Opportunity offers several grant programs for qualifying businesses.',
        links: [
          { name: 'Guide to Applying for Grants (GOEO)', url: 'https://issuu.com/business-utah/docs/goeo-guide-to-applying-for-grants', description: 'A guide from the Governor\'s Office of Economic Opportunity on how to successfully apply for grants.' },
          { name: 'Grants (Governor\'s Office)', url: 'https://business.utah.gov/grants/', description: 'Browse available grant programs from the Utah Governor\'s Office of Economic Opportunity.' },
          { name: 'Tax Incentives (GOEO)', url: 'https://business.utah.gov/business-incentives/', description: 'Learn more about available tax incentives for businesses seeking to expand or relocate to Utah.' },
          { name: 'SBIR/STTR Funding (Nucleus Utah)', url: 'https://www.nucleusutah.org/grow', description: 'SBIR/STTR technology and innovation funding for Utah startups.' },
          { name: 'Grants.gov', url: 'https://grants.gov/', description: 'Search and apply for federal grant opportunities across all government agencies.' },
          { name: 'Utah Innovation Fund', url: 'https://www.utahinnovationfund.com/', description: 'A Utah fund supporting high-growth startups in their early stages.' },
        ],
      },
      {
        heading: 'Crowdfunding',
        description: 'Raise capital from a wide audience of supporters. Success requires a compelling pitch, attractive backer rewards, and an engaged community. Platforms like Kiva, Kickstarter, and GoFundMe serve different business types.',
        links: [
          { name: 'Kiva', url: 'https://www.kiva.org/', description: 'A nonprofit that enables microloans to entrepreneurs who are excluded from traditional financing.' },
          { name: 'Kickstarter', url: 'https://www.kickstarter.com/', description: 'A crowdfunding platform to raise funds from backers who believe in your creative project or product.' },
          { name: 'GoFundMe', url: 'https://www.gofundme.com/', description: 'A crowdfunding platform for raising money from friends, family, and the public.' },
        ],
      },
      {
        heading: 'Business Competitions and Accelerators',
        description: 'Pitch contests and accelerator programs offer both funding and mentorship. Utah has a vibrant competition ecosystem through GROW Utah, Utah Tech Week, and the Utah Entrepreneur Summit.',
        links: [
          { name: 'State Bank Business Challenge', url: 'https://www.suu.edu/business/entrepreneurship/state-bank-business-challenge/', description: 'A business pitch competition at Southern Utah University offering cash prizes.' },
          { name: 'Utah Entrepreneur Summit', url: 'https://lassonde.utah.edu/uec/', description: 'The Utah Entrepreneur Summit brings together founders, investors, and mentors.' },
          { name: 'GROW Utah Competitions & Accelerators', url: 'https://www.growutah.com/contests-accelerators/', description: 'Utah-based pitch competitions and accelerators for early-stage entrepreneurs.' },
          { name: 'Utah Tech Week Pitch Competitions', url: 'https://www.utahtechweek.com/#attend', description: 'Annual pitch competitions during Utah Tech Week.' },
        ],
      },
      {
        heading: 'Small Business Loans',
        description: 'Fund startup costs, operational expenses, or expansion through traditional banks, credit unions, CDFIs, or SBA loan programs. The Utah Small Business Credit Initiative provides additional options for qualifying businesses.',
        links: [
          { name: 'Utah Banks Directory (DFI)', url: 'https://dfi.utah.gov/financial-institutions/banks/', description: 'Directory of banks licensed to operate in Utah.' },
          { name: 'Utah Credit Unions Directory', url: 'https://utahscreditunions.org/index.php/credit-union-directory/', description: 'Directory of credit unions serving Utah communities.' },
          { name: 'CDFI Fund', url: 'https://www.cdfifund.gov/', description: 'Community Development Financial Institutions providing lending to underserved communities.' },
          { name: 'SBA Funding Programs', url: 'https://www.sba.gov/funding-programs', description: 'Explore SBA loan and investment programs for small businesses.' },
          { name: 'Utah Small Business Credit Initiative', url: 'https://business.utah.gov/usbci/', description: 'State-backed credit programs that expand access to small business lending in Utah.' },
        ],
      },
      {
        heading: 'Angel Investors',
        description: 'Individuals who provide early-stage capital in exchange for equity. Utah has active angel networks including Park City Angels, SLC Angels, and the Nucleus Fund.',
        links: [
          { name: 'Park City Angels', url: 'https://www.parkcityangels.com/', description: 'An active angel investor group focused on early-stage Utah companies.' },
          { name: 'SLC Angels', url: 'https://www.slcangels.com/', description: 'Salt Lake City\'s angel investor network funding promising startups.' },
          { name: 'Nucleus Fund', url: 'https://www.nucleusfundutah.com/', description: 'A seed-stage fund supporting Utah\'s most innovative startups.' },
        ],
      },
      {
        heading: 'Venture Capital',
        description: 'Institutional investors who provide larger rounds of capital for high-growth businesses in exchange for equity. Utah\'s VC ecosystem includes EPIC Ventures, Convoi Ventures, Banyan Ventures, and many more.',
        links: [
          { name: 'EPIC Ventures', url: 'https://www.epicvc.com/', description: 'A Utah-based venture capital firm investing in technology companies.' },
          { name: 'Convoi Ventures', url: 'https://www.convoiventures.com/', description: 'A venture capital firm focused on Utah and Mountain West startups.' },
          { name: 'Banyan Ventures', url: 'https://banyangrowthpartners.com/', description: 'A growth-stage investment firm based in Utah.' },
          { name: 'Kickstart Fund', url: 'https://connect.visible.vc/investors/kickstart-seed-fund', description: 'A seed fund backing startups across the Mountain West.' },
          { name: 'Pelion', url: 'https://pelionvp.com/', description: 'A Utah-based venture capital firm investing across multiple sectors.' },
          { name: 'Mercato Partners', url: 'https://www.mercatopartners.com/', description: 'A growth equity firm investing in founder-led companies.' },
          { name: 'Signal Peak Ventures', url: 'https://connect.visible.vc/investors/signal-peak-ventures', description: 'A Salt Lake City-based VC firm investing in technology companies.' },
        ],
      },
    ],
  },
  {
    step: 10,
    phase: 3,
    title: 'Find Office Space',
    goal: 'Secure a productive physical environment for your business.',
    themes: ['Coworking spaces', 'Traditional leases', 'Commercial real estate'],
    topics: ['Start a Business'],
    sections: [
      {
        heading: 'Find Office Space',
        description: 'Finding the right office space is essential for entrepreneurs. A dedicated environment provides the focus and productivity you need to grow, whether that\'s a coworking desk, a private office, or a full commercial lease.',
      },
      {
        heading: 'Coworking Spaces',
        description: 'Coworking spaces play a crucial role in supporting small businesses by providing cost-effective and flexible work environments. They also provide built-in networking opportunities and communities of like-minded entrepreneurs.',
      },
      {
        heading: "Utah's Commercial Real Estate Data",
        description: 'Resimplifi catalogs Utah\'s commercial real estate and makes it accessible to site selectors, property managers, and developers — helping you find the right space for your business\'s needs and location.',
        links: [
          { name: 'Resimplifi — Utah Commercial Real Estate', url: 'https://utah.resimplifi.com/', description: 'Resimplifi catalogs Utah\'s commercial real estate, helping you find available space for your business.' },
        ],
      },
    ],
  },
  {
    step: 11,
    phase: 3,
    title: 'Pay Your Taxes',
    goal: 'Understand and fulfill your business tax obligations in Utah.',
    themes: ['State tax compliance', 'Sales tax', 'Payroll tax', 'Tax planning'],
    topics: ['Taxes and Finance'],
    sections: [
      {
        heading: 'Pay Your Taxes',
        description: 'Every operating business in Utah must understand and fulfill its tax obligations. This includes state income tax, sales tax collection, payroll taxes, and any industry-specific tax requirements. The Utah State Tax Commission provides online resources and tools to help you stay compliant.',
      },
      {
        heading: 'Working with the Utah State Tax Commission',
        description: 'The Tax Commission provides guidance on what you owe, how to file, and available credits or deductions. Use their online portal to manage your business tax accounts, file returns, and make payments — or consult a tax professional for complex situations.',
        links: [
          { name: 'Tax Information for Small Businesses (Utah State Tax Commission)', url: 'https://tax.utah.gov/business', description: 'Understand your Utah business tax obligations and access the state\'s online filing resources.' },
        ],
      },
    ],
  },
  {
    step: 12,
    phase: 3,
    title: 'Join a Community',
    goal: 'Connect with peers, mentors, and professional networks.',
    themes: ['Networking', 'Chambers of commerce', 'Industry associations', 'Mentorship'],
    topics: ['Entrepreneurship Communities'],
    sections: [
      {
        heading: 'Join a Community',
        description: 'Connect with other entrepreneurs, businesspeople, and professional associations for support, advice, and potential partnerships. Community is one of the most powerful assets any entrepreneur can have.',
      },
      {
        heading: 'Business Networks',
        description: 'Build connections, form partnerships, and exchange knowledge with other business owners. Networks provide access to resources, mentorship, and collaborative growth opportunities that you can\'t find on your own.',
        links: [
          { name: 'BNI Utah', url: 'https://bniutah.com/', description: 'A professional networking organization that helps members grow their businesses through referrals.' },
          { name: 'Vistage (CEO Peer Groups)', url: 'https://www.vistage.com/landings/join-ceo-peer-groups/', description: 'Executive peer groups and one-on-one coaching for business leaders.' },
        ],
      },
      {
        heading: 'Chambers of Commerce',
        description: 'Chambers of commerce support local businesses through networking events, advocacy, and shared resources. Utah has chambers representing every region and demographic — find the one that fits your business best.',
        links: [
          { name: 'Utah Association of Chambers Directory', url: 'https://utahassociationofchambers.com/directory/', description: 'Find chambers of commerce across the state of Utah.' },
          { name: 'Utah Asian Chamber of Commerce', url: 'https://utahasianchamber.org/', description: 'Supporting Asian-American businesses and entrepreneurs in Utah.' },
          { name: 'Utah Black Chamber', url: 'https://www.utahblackchamber.com/', description: 'Advocating for and supporting Black-owned businesses in Utah.' },
          { name: 'Utah Hispanic Chamber of Commerce', url: 'https://utahhcc.com/inicio/', description: 'Serving Hispanic entrepreneurs and businesses across Utah.' },
          { name: 'Utah Pacific Islander Chamber', url: 'https://www.upichamber.org/', description: 'Supporting Pacific Islander entrepreneurs and businesses in Utah.' },
          { name: 'Utah LGBTQ Chamber', url: 'https://www.utahlgbtqchamber.org/', description: 'Advocating for LGBTQ+-owned businesses and entrepreneurs in Utah.' },
          { name: 'Utah Rural Chamber Coalition', url: 'https://www.ruralutahcc.org/', description: 'Supporting small businesses in Utah\'s rural communities.' },
        ],
      },
      {
        heading: 'Industry Networks',
        description: 'Utah has specialized industry networks for technology (Silicon Slopes), life sciences (Biohive), aerospace and defense (47G), manufacturing (iMpact Utah), agriculture, banking, and more.',
        links: [
          { name: '47G (Aerospace & Defense)', url: 'https://www.47g.org/', description: 'Utah\'s aerospace and defense industry association.' },
          { name: 'Biohive (Life Sciences)', url: 'https://www.biohive.com/', description: 'Utah\'s life sciences and healthcare industry network.' },
          { name: 'iMpact Utah (Manufacturing)', url: 'https://www.impactutah.org/', description: 'Helps Utah manufacturers grow and thrive through industry connections and resources.' },
          { name: 'Silicon Slopes (Technology)', url: 'https://siliconslopes.com/', description: 'Utah\'s technology and innovation community connecting startups, investors, and talent.' },
          { name: 'Utah Manufacturer\'s Association', url: 'https://manufacturingutah.com/', description: 'The leading alliance for the manufacturing community in Utah.' },
        ],
      },
      {
        heading: "Women's Networks",
        description: 'A supportive environment where female entrepreneurs share experiences, gain insights, and access resources tailored to their unique challenges and opportunities.',
        links: [
          { name: "Women's Business Center Utah", url: 'https://wbcutah.org/', description: 'Helps women-owned businesses succeed with training, advising, and resources.' },
          { name: "Women's Leadership Institute", url: 'https://wliut.com/', description: 'Advancing women in leadership across Utah\'s business community.' },
          { name: 'Tech-Moms', url: 'https://www.tech-moms.org/', description: 'Connecting moms to tech careers and entrepreneurship opportunities.' },
          { name: "Kinect Capital's WeROC", url: 'https://kinectcapital.org/weroc/', description: 'Connecting women entrepreneurs with venture capital and investor networks.' },
        ],
      },
      {
        heading: 'Multicultural Communities',
        description: 'Networks providing belonging and targeted resources for entrepreneurs from diverse and underserved communities — including resources for immigrant entrepreneurs, LGBTQ+ business owners, and other communities.',
        links: [
          { name: 'Center for Economic Opportunity & Belonging', url: 'https://www.belonginutah.org/', description: 'Identifies and promotes actionable solutions to economic disparities in Utah.' },
          { name: 'Suazo Business Center', url: 'https://suazocenter.org/', description: 'A business resource center for Latino/Hispanic and other underserved communities.' },
          { name: 'Utah Center for Immigration and Integration', url: 'https://business.utah.gov/immigration/', description: 'Offering assistance to Utah businesses navigating pathways for global talent.' },
          { name: 'Utah Division of Multicultural Affairs', url: 'https://multicultural.utah.gov/', description: 'Promotes a welcoming climate that builds opportunity and belonging in Utah.' },
        ],
      },
    ],
  },
  {
    step: 13,
    phase: 4,
    title: 'Growth Stage Funding',
    goal: 'Access capital to scale and expand an established business.',
    themes: ['Investor pitching', 'Growth grants', 'Accelerators', 'Venture capital'],
    topics: ['Funding', 'Late Stage Growth'],
    sections: [
      {
        heading: 'Preparing to Pitch to Investors',
        description: 'Refine your pitch by articulating your unique value proposition, honing your brand identity, and crafting a compelling pitch deck. Investors see hundreds of pitches — yours needs to be clear, credible, and memorable.',
        links: [
          { name: 'Pitch Programs — Kinect Capital', url: 'https://kinectcapital.org/pitch-program/', description: 'Pitch program connecting Utah entrepreneurs with investors and mentors.' },
          { name: 'SBA Funding Pitches Tool', url: 'https://ascent.sba.gov/95/51/c7d7ee20481f8456fa607914d6d9/access-to-capital-5-4-funding-pitches-tool.pdf', description: 'An SBA tool to help you prepare and structure a compelling investor pitch.' },
        ],
      },
      {
        heading: 'Grants and Government Funding',
        description: 'Even at the growth stage, government grants remain available. Utah\'s GOEO programs, SBIR/STTR for tech companies, and federal grants through Grants.gov can provide non-dilutive capital to fuel expansion.',
        links: [
          { name: 'Grants (Governor\'s Office)', url: 'https://business.utah.gov/grants/', description: 'Browse available grant programs from the Utah Governor\'s Office of Economic Opportunity.' },
          { name: 'Tax Incentives (GOEO)', url: 'https://business.utah.gov/business-incentives/', description: 'Learn more about available tax incentives for businesses seeking to expand or relocate to Utah.' },
          { name: 'SBIR/STTR Innovation Funding', url: 'https://business.utah.gov/innovation/', description: 'SBIR/STTR technology and innovation funding for Utah companies.' },
          { name: 'Grants.gov', url: 'https://grants.gov/', description: 'Search and apply for federal grant opportunities across all government agencies.' },
          { name: 'Utah Innovation Fund', url: 'https://www.utahinnovationfund.com/', description: 'A Utah fund supporting high-growth startups in their early stages.' },
        ],
      },
      {
        heading: 'Business Competitions and Accelerators',
        description: 'Growth-stage competitions and accelerators offer both capital and strategic mentorship. Kinect Capital, GROW Utah, and the Utah Entrepreneur Summit all provide pathways to funding and exposure.',
        links: [
          { name: 'State Bank Business Challenge', url: 'https://www.suu.edu/business/entrepreneurship/state-bank-business-challenge/', description: 'A business pitch competition at Southern Utah University offering cash prizes.' },
          { name: 'Utah Entrepreneur Summit', url: 'https://lassonde.utah.edu/uec/', description: 'The Utah Entrepreneur Summit brings together founders, investors, and mentors.' },
          { name: 'GROW Utah Competitions & Accelerators', url: 'https://www.growutah.com/contests-accelerators/', description: 'Utah-based pitch competitions and accelerators for early-stage entrepreneurs.' },
          { name: 'Utah Tech Week Pitch Competitions', url: 'https://www.utahtechweek.com/#attend', description: 'Annual pitch competitions during Utah Tech Week.' },
        ],
      },
      {
        heading: 'Growth-Stage Financing',
        description: 'From SBA loans to CDFI funds and state credit initiatives, Utah offers a range of debt financing options to help established businesses fund expansion without giving up equity.',
        links: [
          { name: 'SBA Funding Programs', url: 'https://www.sba.gov/funding-programs', description: 'Explore SBA loan and investment programs for small businesses.' },
          { name: 'Utah Small Business Credit Initiative', url: 'https://business.utah.gov/usbci/', description: 'State-backed credit programs that expand access to small business lending in Utah.' },
          { name: 'Kiva', url: 'https://www.kiva.org/', description: 'A nonprofit that enables microloans to entrepreneurs who are excluded from traditional financing.' },
          { name: 'Kickstarter', url: 'https://www.kickstarter.com/', description: 'A crowdfunding platform to raise funds from backers who believe in your creative project or product.' },
        ],
      },
      {
        heading: 'Angel Investors',
        description: 'Experienced angels provide not just capital but strategic guidance and network access. Utah\'s angel community includes Park City Angels and SLC Angels, both actively funding growth-stage companies.',
        links: [
          { name: 'Park City Angels', url: 'https://www.parkcityangels.com/', description: 'An active angel investor group focused on early-stage Utah companies.' },
          { name: 'SLC Angels', url: 'https://www.slcangels.com/', description: 'Salt Lake City\'s angel investor network funding promising startups.' },
        ],
      },
      {
        heading: 'Venture Capital',
        description: 'Utah\'s VC ecosystem has grown significantly and includes firms specializing in technology, health tech, cleantech, and consumer brands. EPIC Ventures, Convoi, Banyan, and others are actively deploying capital.',
        links: [
          { name: 'EPIC Ventures', url: 'https://www.epicvc.com/', description: 'A Utah-based venture capital firm investing in technology companies.' },
          { name: 'Convoi Ventures', url: 'https://www.convoiventures.com/', description: 'A venture capital firm focused on Utah and Mountain West startups.' },
          { name: 'Banyan Ventures', url: 'https://banyangrowthpartners.com/', description: 'A growth-stage investment firm based in Utah.' },
          { name: 'Pelion', url: 'https://pelionvp.com/', description: 'A Utah-based venture capital firm investing across multiple sectors.' },
          { name: 'Mercato Partners', url: 'https://www.mercatopartners.com/', description: 'A growth equity firm investing in founder-led companies.' },
          { name: 'Signal Peak Ventures', url: 'https://connect.visible.vc/investors/signal-peak-ventures', description: 'A Salt Lake City-based VC firm investing in technology companies.' },
        ],
      },
    ],
  },
  {
    step: 14,
    phase: 4,
    title: 'Strategic Planning for Growth',
    goal: 'Build a structured plan for scaling operations and leadership.',
    themes: ['Growth planning', 'Leadership development', 'Organizational scaling'],
    topics: ['Late Stage Growth'],
    sections: [
      {
        heading: 'Strategic Planning for Growth',
        description: 'As your business reaches significant milestones, strategic planning becomes imperative. This step covers how to navigate the complexity of business expansion, including leadership training, employee management, and scaling your organizational systems.',
      },
      {
        heading: 'Building a Plan for Growth',
        description: 'Structured growth planning helps you navigate the complexity of business expansion. This involves setting clear goals, identifying resources, anticipating risks, and creating accountability systems — often with help from experienced advisors.',
        links: [
          { name: 'The Five Stages of Small Business Growth (HBR)', url: 'https://hbr.org/1983/05/the-five-stages-of-small-business-growth', description: 'A Harvard Business Review framework for understanding the five stages every growing business passes through.' },
          { name: 'Writing a Business Growth Plan', url: 'https://www.business.com/articles/writing-a-business-growth-plan/', description: 'How to write a structured plan for scaling your business operations.' },
        ],
      },
      {
        heading: 'Leadership Training',
        description: 'Investing in leadership training cultivates strong, capable leaders who improve decision-making, workplace culture, and organizational resilience. Utah has programs through the SBA and private organizations to develop your leadership team.',
        links: [
          { name: 'CliftonStrengths for Teams (Gallup)', url: 'https://www.gallup.com/cliftonstrengths/en/252137/home.aspx', description: 'Assess your team\'s natural strengths to build a more effective organization.' },
          { name: 'Thrive Leadership Training (SBA)', url: 'https://www.sba.gov/sba-learning-platform/thrive-emerging-leaders-reimagined', description: 'SBA\'s leadership training program for established small business owners ready to scale.' },
        ],
      },
    ],
  },
  {
    step: 15,
    phase: 4,
    title: 'Workforce & Talent Acquisition',
    goal: 'Attract and retain the skilled employees your growth requires.',
    themes: ['Competitive compensation', 'Talent pipelines', 'Workforce development'],
    topics: ['Late Stage Growth'],
    sections: [
      {
        heading: 'Workforce and Talent Acquisition',
        description: 'Investing in your workforce enhances productivity, employee satisfaction, and overall business success. As you scale, finding and retaining the right talent becomes one of your most important strategic priorities.',
      },
      {
        heading: 'Supporting Workforce Acquisition',
        description: 'Public and private organizations assist small businesses through job-matching services and workforce development programs. Utah\'s Department of Workforce Services and Talent Ready Utah help connect employers with qualified candidates and education-to-industry pipelines.',
        links: [
          { name: 'Department of Workforce Services', url: 'https://jobs.utah.gov/', description: 'Utah\'s Department of Workforce Services connects employers with job seekers and workforce programs.' },
          { name: 'Talent Ready Utah', url: 'https://talentready.ushe.edu/', description: 'Connects businesses with education-to-industry pipelines and apprenticeship programs.' },
        ],
      },
    ],
  },
  {
    step: 16,
    phase: 4,
    title: 'Obtain Government Contracts',
    goal: 'Compete for government contracts as a stable revenue stream.',
    themes: ['Federal contracting', '8(a) program', 'Compliance requirements'],
    topics: ['Late Stage Growth'],
    sections: [
      {
        heading: 'Obtain Government Contracts',
        description: 'Government contracts are a significant opportunity for businesses across all industries, providing a stable revenue stream and institutional credibility. Contracts span construction, technology, healthcare, manufacturing, and professional services.',
      },
      {
        heading: 'Navigating Government Contracts',
        description: 'Government contracting is complex, with specific compliance and certification requirements. Utah\'s APEX Accelerators program provides free one-on-one consulting from the Governor\'s Office to help businesses successfully navigate the contracting process.',
        links: [
          { name: 'APEX Accelerators (Governor\'s Office)', url: 'https://business.utah.gov/apex/', description: 'Free 1:1 consulting from the Governor\'s Office helping Utah businesses compete in the government marketplace.' },
          { name: 'Federal Contracting (SBA)', url: 'https://www.sba.gov/federal-contracting', description: 'Learn how your business can compete for federal contracts and the programs designed to assist you.' },
        ],
      },
      {
        heading: 'Contracting Resources for Underserved Communities',
        description: 'The SBA\'s 8(a) Business Development Program supports small businesses owned by individuals from socially and economically disadvantaged communities — providing access to sole-source contracts and business development assistance.',
        links: [
          { name: '8(a) Business Development Program (SBA)', url: 'https://www.sba.gov/federal-contracting/contracting-assistance-programs/8a-business-development-program', description: 'A federal contracting and training program for small businesses owned by socially and economically disadvantaged individuals.' },
        ],
      },
    ],
  },
  {
    step: 17,
    phase: 4,
    title: 'International Trade',
    goal: 'Expand your business into international markets.',
    themes: ['Export strategy', 'International IP protection', 'Trade relationships'],
    topics: ['International Trade'],
    sections: [
      {
        heading: 'International Trade',
        description: 'Expand your business by looking overseas for valuable revenue streams and important business relationships. Utah\'s central location, international airport, and strong trade relationships make it an ideal home base for global expansion.',
        links: [
          { name: 'International Trade & Diplomacy (Governor\'s Office)', url: 'https://business.utah.gov/international/', description: 'Utah\'s state office supporting businesses seeking to expand into international markets.' },
        ],
      },
      {
        heading: 'Supporting International Businesses',
        description: 'State-level economic development agencies, trade associations, and international commerce centers assist small businesses with export strategy, market research, and international partnerships. Utah has strong relationships in key global markets.',
        links: [
          { name: 'World Trade Association of Utah', url: 'https://wtaofutah.com/', description: 'Promotes international trade and business relationships for Utah companies.' },
          { name: 'World Trade Center Utah', url: 'https://www.wtcutah.com/', description: 'Connects Utah businesses with global trade networks and international opportunities.' },
        ],
      },
      {
        heading: 'Protect Your International Intellectual Property',
        description: 'IP protection is regional and country-specific — what\'s protected in the US may not be protected abroad. Understand how IP laws vary by jurisdiction and file international protections through WIPO and country-specific patent offices before entering new markets.',
        links: [
          { name: 'USPTO IP Policy', url: 'https://www.uspto.gov/ip-policy', description: 'Information on international IP engagement, policies, and treaties from the USPTO.' },
          { name: 'World Intellectual Property Organization (WIPO)', url: 'https://www.wipo.int/portal/en/', description: 'The United Nations agency that serves the world\'s inventors and administers international IP treaties.' },
          { name: 'European Patent Office', url: 'https://www.epo.org/en', description: 'File and manage European patent applications through the European Patent Office.' },
          { name: 'Japan Patent Office', url: 'https://www.jpo.go.jp/e/', description: 'Apply for patent protection in Japan through the Japan Patent Office.' },
          { name: 'United States Patent & Trademark Office', url: 'https://www.uspto.gov/', description: 'The USPTO is the federal agency for granting US patents and registering trademarks in the United States.' },
        ],
      },
    ],
  },
  {
    step: 18,
    phase: 5,
    title: 'Relocate Your Business to Utah',
    goal: "Leverage Utah's tax incentives and business-friendly environment.",
    themes: ['Tax incentives', 'Relocation support', 'Economic development'],
    topics: ['Relocate a Business to Utah'],
    sections: [
      {
        heading: 'Relocate Your Business to Utah',
        description: 'Utah offers competitive tax incentives and other benefits to businesses interested in relocating. With a top-ranked business climate, a young and educated workforce, and a central western U.S. location, Utah is one of the best places in the country to grow a business.',
      },
      {
        heading: 'Economic Development Organizations',
        description: 'Key organizations support business relocation to Utah, from the Economic Development Corporation of Utah (EDCUtah) to the Governor\'s Office of Economic Opportunity. These organizations can guide you through incentive programs, site selection, and workforce planning.',
        links: [
          { name: 'Economic Development Corporation of Utah (EDCUtah)', url: 'https://www.edcutah.org/', description: 'Utah\'s primary economic development organization helping businesses relocate and expand.' },
          { name: "Governor's Office of Economic Opportunity", url: 'https://business.utah.gov/', description: 'The Governor\'s Office of Economic Opportunity supporting Utah business growth.' },
          { name: 'World Trade Center Utah', url: 'https://www.wtcutah.com/', description: 'Connects Utah businesses with global trade networks and international opportunities.' },
        ],
      },
      {
        heading: 'Business Incentives',
        description: "Utah's economy continues to lead the nation with its business-friendly environment. Financial incentives are available for qualifying companies that create jobs and invest in the state — including tax credits, grants, and industrial assistance programs.",
        links: [
          { name: 'Business Incentives (GOEO)', url: 'https://business.utah.gov/business-incentives/', description: 'Learn more about available tax incentives for businesses seeking to expand or relocate to Utah.' },
          { name: 'Targeted Industries (GOEO)', url: 'https://business.utah.gov/targeted-industries/', description: 'Learn about Utah\'s targeted industries and the opportunities available for businesses in those sectors.' },
        ],
      },
      {
        heading: 'Industry Profiles and Whitepapers',
        description: 'Access economic data and sector-specific insights about Utah\'s market landscape through EDCUtah and the Gardner Policy Institute. These resources help you understand the competitive dynamics of Utah\'s key industries.',
        links: [
          { name: 'Utah Industry Profiles & Whitepapers (EDCUtah)', url: 'https://www.edcutah.org/research/research-main', description: 'Economic data and sector-specific insights about Utah\'s market landscape.' },
          { name: 'Kim C. Gardner Policy Institute', url: 'https://gardner.utah.edu/', description: 'Independent economics and public policy research about Utah\'s economy.' },
        ],
      },
    ],
  },
  {
    step: 19,
    phase: 5,
    title: 'Close Your Business',
    goal: 'Navigate selling or dissolving your business responsibly.',
    themes: ['Business valuation', 'Sale process', 'Legal dissolution'],
    topics: ['Close or Exit a Business'],
    sections: [
      {
        heading: 'Sell or Close Your Business',
        description: "You've built a successful business from the ground up. Perhaps now it's time to exit and move on to your next idea — whether that means selling to a new owner, passing it on to family, or formally dissolving the entity.",
      },
      {
        heading: 'Exit Strategy Overview',
        description: 'Business exits can stem from seeking change, retirement, or new opportunities. A well-planned exit requires understanding your options, the tax implications of each path, and whether succession planning requires changing your legal structure.',
      },
      {
        heading: 'Selling Your Business',
        description: 'A sale provides a significant payout and monetizes the value you\'ve built. Preparing for a sale means scaling operations, cleaning up financials, and ensuring your business can run independently of you — buyers pay a premium for systems-dependent businesses.',
        links: [
          { name: 'Purchasing or Selling a Business (Utah Tax Commission)', url: 'https://tax.utah.gov/business/successor-liability', description: 'Learn what Utah law requires if you\'re selling or purchasing a business.' },
        ],
      },
      {
        heading: 'Dissolving a Business',
        description: 'When a business terminates or changes legal status, specific licensing and regulatory requirements must be met. Utah has a clear dissolution process through Utah.gov to ensure you close out your obligations properly.',
        links: [
          { name: 'How to Dissolve a Business (Utah.gov)', url: 'https://www.utah.gov/business/closing/', description: 'Learn about the licensing and regulatory requirements that must be met when dissolving a business.' },
        ],
      },
    ],
  },
]

export function getStepByNumber(n: number): JourneyStep | undefined {
  return JOURNEY_STEPS.find(s => s.step === n)
}

export function getPhaseForStep(n: number): string {
  const phase = JOURNEY_PHASES.find(p => p.steps.includes(n))
  return phase ? `Phase ${phase.number}: ${phase.label}` : ''
}
