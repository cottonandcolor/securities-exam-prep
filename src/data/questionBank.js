export const exams = [
  {
    id: 'sie',
    name: 'SIE',
    description: 'Securities Industry Essentials',
  },
  {
    id: 'series7',
    name: 'Series 7',
    description: 'General Securities Representative',
  },
  {
    id: 'series63',
    name: 'Series 63',
    description: 'Uniform Securities Agent State Law',
  },
  {
    id: 'series66',
    name: 'Series 66',
    description: 'Combined State Law (63 + 65)',
  },
]

export const questionBank = {
  sie: [
    {
      id: 'sie-1',
      topic: 'Regulatory Structure',
      question: 'What is FINRA’s primary role in the securities industry?',
      choices: [
        'Issuing U.S. Treasury securities',
        'Self-regulation and oversight of broker-dealers',
        'Setting federal tax rates',
        'Providing FDIC insurance',
      ],
      answerIndex: 1,
      explanation:
        'FINRA is a self-regulatory organization that oversees broker-dealers and enforces industry rules.',
    },
    {
      id: 'sie-2',
      topic: 'Types of Markets',
      question:
        'A trade executed directly between two institutions without an exchange is most likely in which market?',
      choices: [
        'Primary market',
        'Auction market',
        'Over-the-counter market',
        'Open-end fund market',
      ],
      answerIndex: 2,
      explanation:
        'OTC trading occurs through dealer networks rather than a centralized exchange auction.',
    },
    {
      id: 'sie-3',
      topic: 'Customer Accounts',
      question: 'What is a key feature of a cash account?',
      choices: [
        'Customer may borrow from the broker-dealer',
        'Transactions must be fully paid by settlement',
        'Short sales are always allowed',
        'Options approval is automatic',
      ],
      answerIndex: 1,
      explanation:
        'Cash accounts require customers to pay in full for purchases by the settlement date.',
    },
    {
      id: 'sie-4',
      topic: 'Risk Concepts',
      question: 'Which risk is most associated with bond prices falling when rates rise?',
      choices: [
        'Inflation risk',
        'Reinvestment risk',
        'Interest rate risk',
        'Business risk',
      ],
      answerIndex: 2,
      explanation:
        'Interest rate risk describes the inverse relationship between bond prices and interest rates.',
    },
    {
      id: 'sie-5',
      topic: 'Investment Companies',
      question:
        'Which type of investment company continuously offers and redeems shares at NAV?',
      choices: [
        'Closed-end fund',
        'ETF',
        'Open-end mutual fund',
        'Unit investment trust traded intraday',
      ],
      answerIndex: 2,
      explanation:
        'Open-end mutual funds issue and redeem shares directly with investors at end-of-day NAV.',
    },
  ],
  series7: [
    {
      id: 's7-1',
      topic: 'Options',
      question: 'Buying a call option generally reflects what outlook?',
      choices: [
        'Bullish on the underlying security',
        'Bearish on the underlying security',
        'Neutral with no volatility view',
        'Guaranteed income regardless of movement',
      ],
      answerIndex: 0,
      explanation:
        'A long call benefits when the underlying price rises above the strike plus premium paid.',
    },
    {
      id: 's7-2',
      topic: 'Suitability',
      question:
        'For a recommendation to be suitable, which factor is most important to document?',
      choices: [
        'Representative’s years of service',
        'Customer profile and investment objectives',
        'Issuer marketing materials',
        'Social media sentiment',
      ],
      answerIndex: 1,
      explanation:
        'Suitability is based on the customer’s profile, including objectives, risk tolerance, and finances.',
    },
    {
      id: 's7-3',
      topic: 'Municipal Securities',
      question: 'Interest from most municipal bonds is typically:',
      choices: [
        'Taxable at federal level',
        'Exempt from federal income tax',
        'Taxed as ordinary dividends',
        'Subject to payroll tax',
      ],
      answerIndex: 1,
      explanation:
        'Municipal bond interest is generally exempt from federal income tax, with exceptions.',
    },
    {
      id: 's7-4',
      topic: 'Communications',
      question: 'Retail communications generally require what before first use?',
      choices: [
        'No review requirement',
        'Customer written approval',
        'Principal approval under firm procedures',
        'SEC pre-approval in all cases',
      ],
      answerIndex: 2,
      explanation:
        'Firm supervisory procedures typically require principal review/approval for retail communications.',
    },
    {
      id: 's7-5',
      topic: 'Trade Settlement',
      question:
        'In a regular-way secondary equity trade, settlement currently occurs on:',
      choices: ['T+0', 'T+1', 'T+2', 'T+3'],
      answerIndex: 1,
      explanation: 'U.S. regular-way settlement for most equities is currently T+1.',
    },
  ],
  series63: [
    {
      id: 's63-1',
      topic: 'Registration',
      question:
        'Under typical state law concepts, who is generally required to register as an agent?',
      choices: [
        'Any individual representing a broker-dealer in securities transactions',
        'Only individuals selling U.S. government securities',
        'Only branch managers',
        'Only individuals with discretionary authority',
      ],
      answerIndex: 0,
      explanation:
        'Agents who represent broker-dealers in effecting securities transactions generally must register.',
    },
    {
      id: 's63-2',
      topic: 'Fraud',
      question: 'A material omission in a client recommendation is best classified as:',
      choices: [
        'A permitted sales technique',
        'A fraudulent practice',
        'An administrative filing issue only',
        'A bookkeeping error',
      ],
      answerIndex: 1,
      explanation:
        'Material misstatements or omissions can be fraudulent under state and federal anti-fraud rules.',
    },
    {
      id: 's63-3',
      topic: 'Fiduciary Concepts',
      question: 'Fiduciary duty generally requires advisers to:',
      choices: [
        'Prioritize the firm’s compensation',
        'Act in clients’ best interests',
        'Guarantee investment returns',
        'Avoid all risk for clients',
      ],
      answerIndex: 1,
      explanation:
        'A fiduciary standard includes loyalty and care, placing client interests first.',
    },
    {
      id: 's63-4',
      topic: 'Administrator Powers',
      question: 'A state administrator may generally:',
      choices: [
        'Issue criminal convictions directly',
        'Conduct investigations and issue orders',
        'Set federal monetary policy',
        'Approve IPO prices',
      ],
      answerIndex: 1,
      explanation:
        'Administrators can investigate and take administrative actions within state law authority.',
    },
    {
      id: 's63-5',
      topic: 'Ethics',
      question: 'Churning is most closely associated with:',
      choices: [
        'Excessive trading to generate commissions',
        'Long-term passive investing',
        'Using index funds',
        'Reducing turnover to lower costs',
      ],
      answerIndex: 0,
      explanation:
        'Churning involves excessive transactions inconsistent with a client’s profile and objectives.',
    },
  ],
  series66: [
    {
      id: 's66-1',
      topic: 'Advisers',
      question: 'An investment adviser representative primarily:',
      choices: [
        'Executes exchange listings',
        'Provides advice about securities for compensation',
        'Insures bank deposits',
        'Approves municipal budgets',
      ],
      answerIndex: 1,
      explanation:
        'IARs provide securities advice as representatives of investment advisers.',
    },
    {
      id: 's66-2',
      topic: 'Disclosures',
      question:
        'Why are clear disclosure of fees and conflicts important in advisory relationships?',
      choices: [
        'To eliminate all market risk',
        'To support informed client consent',
        'To replace suitability obligations',
        'To avoid keeping records',
      ],
      answerIndex: 1,
      explanation:
        'Transparent disclosures help clients understand conflicts and make informed decisions.',
    },
    {
      id: 's66-3',
      topic: 'Portfolio Concepts',
      question: 'Diversification is primarily used to:',
      choices: [
        'Increase unsystematic risk',
        'Reduce unsystematic risk',
        'Eliminate all market risk',
        'Lock in guaranteed gains',
      ],
      answerIndex: 1,
      explanation:
        'Diversification can reduce issuer-specific (unsystematic) risk, not all market risk.',
    },
    {
      id: 's66-4',
      topic: 'Economics',
      question: 'A rising interest rate environment often has what effect on bond prices?',
      choices: [
        'Bond prices usually rise',
        'Bond prices usually fall',
        'No relationship exists',
        'Only short-term bonds are affected',
      ],
      answerIndex: 1,
      explanation:
        'Bond prices and interest rates generally move in opposite directions.',
    },
    {
      id: 's66-5',
      topic: 'Client Profile',
      question: 'A moderate-risk client likely needs a recommendation that is:',
      choices: [
        'Aggressive and concentrated',
        'Aligned with risk tolerance and goals',
        'Based only on recent performance',
        'Focused on one asset class',
      ],
      answerIndex: 1,
      explanation:
        'Recommendations should align with the client’s risk tolerance, horizon, and objectives.',
    },
  ],
}
