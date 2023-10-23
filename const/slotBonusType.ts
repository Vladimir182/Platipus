export enum SlotBonusType {
    None,
    Bonus,
    FreeSpin,
    Respin,
    Cascade,
    RandomMultiplier,
    BonusWheel = 6
}

export const slotBonusType = new Map([
    [SlotBonusType.None,                'Unknown'],
    [SlotBonusType.Bonus,               'Bonus'],
    [SlotBonusType.FreeSpin,            'Free Spin'],
    [SlotBonusType.Respin,              'Respin'],
    [SlotBonusType.Cascade,             'Cascade'],
    [SlotBonusType.RandomMultiplier,    'Random Multiplier'],
    [SlotBonusType.BonusWheel,          'Jackpot Wheel Feature']
]);
