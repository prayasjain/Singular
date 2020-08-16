
export class Constants {

    public static readonly ASSET_TYPES = {
        gold: 'gold',
        realEstate: 'real-estate',
        ePF: 'epf',
        pPf: 'ppf',
        cash: 'cash',
        equity: 'equity',
        mutualFunds: 'mutual-funds',
        deposits: 'deposits',
        savingsAccount: 'savings-account'
    };
    public static readonly DISPLAY_DATE_FORMAT = {
        enGB: 'en-GB'
    };

    public static readonly EXCEL_SHEET_HEADERS = {
        Gold: 'gold',
        'Real Estate': 'realEstate',
        EPF: 'ePF',
        PPF: 'pPf',
        Cash: 'cash',
        Equity: 'equity',
        'Mutual Funds': 'mutualFunds',
        Deposits: 'deposits',
        'Savings Account': 'savingsAccount',
        Others: 'others'
    };

    public static readonly DUMMY_DATA = [
        { x: 1, y: 2 },
        { x: 2500, y: 2.5 },
        { x: 3000, y: 5 },
        { x: 3400, y: 4.75 },
        { x: 3600, y: 4.75 },
        { x: 5200, y: 6 },
        { x: 6000, y: 9 },
        { x: 7100, y: 6 },
    ];
    public static readonly GRAPH_FILTER_OPTIONS = {
        YEARLY: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
                'Sept', 'Oct', 'Nov', 'Dec'],
            data: [1, 2, 4, 50, 34, 34, 34, 21, 42, 676, 454, 45]
        },
        SIX_MONTHS: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [34, 21, 42, 676, 454, 45]
        },
        WEEKLY: {
            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
            data: [13, 45, 56, 676, 454, 45, 70]
        },

    };

    public static readonly FILTER_OPTIONS = {
        YEARLY: 'YEARLY',
        SIX_MONTHS: 'SIX_MONTHS',
        ONE_MONTH: 'ONE_MONTH',
        WEEKLY: 'WEEKLY'
    };

}
