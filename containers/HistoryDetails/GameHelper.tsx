import React from 'react'
import {FORMATS} from "app/const/moneyFormatter";
import {formatNumberData, shortFormatNumber, roundValue} from "app/utils";
import ALL_GAMES from "app/const/allGames";
import { ISlotBonus, ISlotBuy } from "app/const/platipus";
import { SlotBonusType, slotBonusType } from "app/const/slotBonusType";

export default class GameHelper {

    static getGameConfigById = (row: any) => {
        return ALL_GAMES.filter(g => parseInt(g.id) === row.gameId)[0];
    }

    static getBet = (row: any) =>  {
        return (row.bet || (row.data && row.data.bet)) || null;
    }

    static getTotalBet = (row: any) =>  {
        const bet = GameHelper.getBet(row);
        const gameConfig = GameHelper.getGameConfigById(row);
        return bet * gameConfig.lines;
    }

    static getCurrencyFormat = (row: any) => {
        const currency = row && row['currency'] ? row['currency'] : ``;
        return FORMATS[currency] ? `${FORMATS[currency]['symbol']}` : `${currency}`;
    }

    static transformWin = (win: number, row: any) => {
        const bet = GameHelper.getTotalBet(row);
        const winValue = win * (bet*10)/10;
        return shortFormatNumber(winValue, true);
    }

    static getFeature = (row: any) => {
        return (row.feature || (row.data && row.data.feature)) || null;
    }

    static hasFeatureWin = (row: any) => {
        const feature = GameHelper.getFeature(row);
        return feature && feature['win'] && feature['win'] > 0;
    }

    static hasFeatureWinToBank = (row: any) => {
        const feature = GameHelper.getFeature(row);
        return feature && feature['toBank'] && feature['toBank'] > 0;
    }

    static getFeatureWin = (row: any) => {
        const feature = GameHelper.getFeature(row);
        return GameHelper.hasFeatureWin(row) ? feature.win : 0;
    }

    static getFeatureJackpots = (row: any) => {
        const feature = GameHelper.getFeature(row);
        return feature && feature.jackpots ? feature.jackpots : []
    }

    static getFeatureJackpot = (row: any): string => {
        const feature = GameHelper.getFeature(row);
        return feature && feature.jackpot ? feature.jackpot : '';
    }

    static getFeatureWinLimit = (row: any): number => {
        const feature = GameHelper.getFeature(row);
        return feature && feature['WinLimit'] && feature['WinLimit'] > 0 ? +feature.WinLimit : 0;
    }

    static getFeatureWinToBank = (row: any) => {
        const feature = GameHelper.getFeature(row);
        return GameHelper.hasFeatureWinToBank(row) ? feature.toBank : 0;
    }

    static getCatchTheLeprechaunFeatureWinText = (row: any) => {
        const format = GameHelper.getCurrencyFormat(row);
        const win = GameHelper.getFeatureWin(row);
        const winText = GameHelper.transformWin(win, row);
        return `+ ${format} ${winText} Catch the Leprechaun feature win`;
    }

    static getCatchTheLeprechaunFeatureWinToBankText = (row: any) => {
        const format = GameHelper.getCurrencyFormat(row);
        const win = GameHelper.getFeatureWinToBank(row);
        const winText = GameHelper.transformWin(win, row);
        return `+ ${format} ${winText} Catch the Leprechaun feature win`;
    }

    static getCollectFeatureWinText = (row: any) => {
        const format = GameHelper.getCurrencyFormat(row);
        const win = GameHelper.getFeatureWin(row);
        const winText = GameHelper.transformWin(win, row);
        return `+ ${format} ${winText} Collect feature win`;
    }

    static hasBonus = (row: any) => row.cmd && (row.cmd === 'spin' || row.cmd === 'gift spin') && row.bonus && row.bonus.bonusId;

    static hasBonusId = (row: any, ids: number[]) => GameHelper.hasBonus(row) && ids.indexOf(+row.bonus.bonusId) > -1;

    static getBonusId = (row: any, ids: number[]) => GameHelper.hasBonusId(row, ids) ? +row.bonus.bonusId : 0;

    static hasBonusInBonus = (row: any) => row.data && row.data.bonus && row.data.bonus.bonusId;

    static hasBonusIdInBonus = (row: any, ids: number[]) => GameHelper.hasBonusInBonus(row) && ids.indexOf(+row.data.bonus.bonusId) > -1;

    static getBonusIdInBonus = (row: any, ids: number[]) => GameHelper.hasBonusIdInBonus(row, ids) ? +row.data.bonus.bonusId : 0;

    static getOptionsInBonus = (row: any, ids: number[]) => GameHelper.hasBonusIdInBonus(row, ids) ? +row.data.bonus.options : 0;

    static getTypeNameById = (typeId: SlotBonusType) => {
        return slotBonusType.has(typeId) ? slotBonusType.get(typeId) : slotBonusType.get(SlotBonusType.None);
    }

    static getBonusName = (bonus: ISlotBonus[], bonusId: number) => {
        const type = bonus.filter(x => x.id === bonusId);
        const typeId = type.length ? type[0].type : SlotBonusType.None;

        return GameHelper.getTypeNameById(typeId);
    }

    static getBonusState = (row: any, ids: number[]) => {
        return {
            id: GameHelper.getBonusId(row, ids),
            active: GameHelper.hasBonusId(row, ids),
        }
    }

    static hasGiftSpin = (row: any) => row.cmd && row.cmd === 'gift spin' && row.bonus_spin;

    static hasBuyBonus = (row: any) => row.cmd && row.cmd === 'spin' && row['buyId'] && row.bonus && row.bonus.bonusId;

    static hasBuyBonusId = (row: any, ids: number[]) => GameHelper.hasBuyBonus(row) && ids.indexOf(+row.bonus.bonusId) > -1;

    static getFeatureBonuswheelPrice = (row: any) => {
        let record = row.data ? row.data : row;
        let feature = record.feature;
        return feature && feature.bonuswheel_price;
    }

    static getSpinText = (row: any) => {
        const hasGift = GameHelper.hasGiftSpin(row);
        return <><span>{hasGift ? 'gift spin' : 'spin'}</span><br/></>;
    }

    static getBonusText = (row: any, id_fs: ISlotBonus[]) => {
        const idFsFiltered = id_fs.filter(x => x.id === row.id_fs);
        const typeId = idFsFiltered.length ? idFsFiltered[0].type : SlotBonusType.None;
        const bonusText = GameHelper.getTypeNameById(typeId);
        return <><span>{`${bonusText}`.toLowerCase()}</span><br/></>;
    }

    static getFeatureText = (featureName: string) => <><span className={'gift-count-badge'}>{`+ ${featureName} feature`}</span><br/></>;

    static getBonusFeatureText = (row: any, bonus: ISlotBonus[], buy: ISlotBuy[]) => {

        const idsBonus = bonus.map(x => x.id);
        let hasBuy = GameHelper.hasBuyBonusId(row, idsBonus);
        let bonusState = GameHelper.getBonusState(row, idsBonus);
        const featureName = `${hasBuy ? 'Buy' : ''} ${bonusState.active ? GameHelper.getBonusName(bonus, bonusState.id) : ''}`;

        return <>{ bonusState.active ? GameHelper.getFeatureText(featureName) : null }</>
    }

    static getJackpotBuyFeature = (row: any) => {
        const hasSpecialBuyBonus = row && row['buyId'] && row['buyId'] === 2 && row['feature'] && row['feature'] && row['feature']['bonuswheel_price'];
        const featureName = 'Buy Jackpot';
        return <>{ hasSpecialBuyBonus ? GameHelper.getFeatureText(featureName) : null }</>
    }

    static getFeatureJackpotText = (row: any) => {
        const featureJackpot = GameHelper.getFeatureJackpot(row);
        return featureJackpot.length ? <><span className={'gift-count-badge'}>{`+ ${featureJackpot} jackpot`}</span><br/></> : null
    }

    static getFeatureWinLimitText = (row: any) => {
        const format = GameHelper.getCurrencyFormat(row);
        const featureWinLimit = GameHelper.getFeatureWinLimit(row);
        const winText = GameHelper.transformWin(featureWinLimit, row);
        return featureWinLimit > 0 ? <><span className={'gift-count-badge'}>{`+ ${format} ${winText} win limit`}</span><br/></> : null
    }

    static getFeatureBonuswheePriceText = (row: any) => {
        const bonuswheelPrice = GameHelper.getFeatureBonuswheelPrice(row);
        const totalBet = GameHelper.getTotalBet(row)
        let bonusWheelWin = bonuswheelPrice ? formatNumberData(roundValue(bonuswheelPrice * totalBet)) : 0;
        const format = GameHelper.getCurrencyFormat(row);
        const featureJackpots = GameHelper.getFeatureJackpots(row);
        return GameHelper.getFeatureBonuswheelPrice(row) ? <>
            <span className={'gift-count-badge'}>{`+ ${format} ${bonusWheelWin} Jackpot Feature win`}</span><br/>
            {featureJackpots.map((j: any) => <span key={j} className={'gift-count-badge'}>{`${j}`}<br/></span>)}
        </> : null;
    }

    static getExtraFreeSpinText = (row: any, bonus: ISlotBonus[]) => {

        const idsBonus = bonus.filter(x=> x.type === SlotBonusType.FreeSpin).map(x => x.id);
        const hasBonusId = GameHelper.hasBonusIdInBonus(row, idsBonus);
        const options = GameHelper.getOptionsInBonus(row, idsBonus);
        const isOptionsOne = +`${options}`.split('').slice(-1).join('') === 1;

        if (options > 0) {
            return hasBonusId ? <><span className={'gift-count-badge'}>{`+ ${options} free spin${isOptionsOne ? `` : `s`}`}</span><br/></> : null;
        } else {
            return hasBonusId ? <><span className={'gift-count-badge'}>{`+ free spins`}</span><br/></> : null;
        }

    };

    static getBonusWheelFeatureText = (row: any, bonus: ISlotBonus[]) => {
        const idsBonus = bonus.filter(x=> x.type === SlotBonusType.BonusWheel).map(x => x.id);
        const hasBonusId = GameHelper.hasBonusIdInBonus(row, idsBonus);

        return hasBonusId ? <><span className={'gift-count-badge'}>{`+ ${slotBonusType.get(SlotBonusType.BonusWheel)}`}</span><br/></> : null;

    };

    static getCascadeText = (row: any, bonus: ISlotBonus[]) => {

        const idsBonus = bonus.filter(x=> x.type === SlotBonusType.Cascade).map(x => x.id);
        const hasBonusId = GameHelper.hasBonusIdInBonus(row, idsBonus);

        return hasBonusId ? <><span className={'gift-count-badge'}>{`+ cascade`}</span><br/></> : null;
    };

    public static handleSpin = (row: any, bonus: ISlotBonus[], buy: ISlotBuy[], metadata: any) => {
        return <div>
            {GameHelper.getSpinText(row)}
            {GameHelper.getBonusFeatureText(row, bonus, buy)}
            {GameHelper.getJackpotBuyFeature(row)}
            {GameHelper.getFeatureBonuswheePriceText(row)}
            {GameHelper.getFeatureJackpotText(row)}
        </div>;
    }

    public static handleBonus = (row: any, bonus: ISlotBonus[], id_fs: ISlotBonus[], metadata: any) => {
        return <div>
          {GameHelper.getBonusText(row, id_fs)}
          {GameHelper.getExtraFreeSpinText(row, bonus)}
          {GameHelper.getCascadeText(row, bonus)}
          {GameHelper.getFeatureBonuswheePriceText(row)}
          {GameHelper.getFeatureJackpotText(row)}
          {GameHelper.getFeatureWinLimitText(row)}
          {GameHelper.getBonusWheelFeatureText(row, bonus)}
        </div>;
    }

}
