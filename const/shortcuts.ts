import * as moment from 'moment'

let lang = localStorage.getItem('lang') || 'en';
moment.locale(lang);
export default [
  {
    key: 0,
    text: 'Today',
    type: 'today',
    start: moment(moment().utc().startOf('day')).format('YYYY-MM-DD 00:00:00'),
    end: moment().utc().add(1, 'days').format('YYYY-MM-DD 00:00:00')
  },
  {
    key: 1,
    text: 'Yesterday',
    type: 'yesterday',
    start: moment(moment().utc().add(-1, 'days').startOf('day')).format('YYYY-MM-DD 00:00:00'),
    end: moment().utc().format('YYYY-MM-DD 00:00:00')
  },
  {
    key: 2,
    text: 'This Week',
    type: 'thisweek',
    start: moment(moment().utc().startOf('week')).format('YYYY-MM-DD 00:00:00'),
    end: moment().utc().add(1, 'days').format('YYYY-MM-DD 00:00:00')
  },
  {
    key: 3,
    text: 'Last Week',
    type: 'lastweek',
    start: moment(moment().add(-1, 'weeks').startOf('week')).format('YYYY-MM-DD 00:00:00'),
    end: moment(moment().add(-1, 'weeks').endOf('week').add(1, 'days')).format('YYYY-MM-DD 00:00:00')
  },
  {
    key: 4,
    text: 'This Month',
    type: 'thismonth',
    start: moment(moment().utc().startOf('month')).format('YYYY-MM-DD 00:00:00'),
    end: moment().utc().add(1, 'days').format('YYYY-MM-DD 00:00:00')
  },
  {
    key: 5,
    text: 'Last Month',
    type: 'lastmonth',
    start: moment(moment().add(-1, 'months').startOf('month')).format('YYYY-MM-DD 00:00:00'),
    end: moment(moment().add(-1, 'months').endOf('month')).add(1, 'days').format('YYYY-MM-DD 00:00:00')
  },
  {
    key: 6,
    text: 'This Year',
    type: 'thisyear',
    start: moment(moment().utc().startOf('year')).format('YYYY-MM-DD 00:00:00'),
    end: moment().utc().add(1, 'days').format('YYYY-MM-DD 00:00:00')
  }
].map((val: any) => {
  let startOffset = moment(val.start).utcOffset()/60;
  let endOffset = moment(val.end).utcOffset()/60;

  return {
    ...val,
    start: moment(val.start).add(startOffset, 'hour'),
    end: moment(val.end).add(endOffset, 'hour')
  }
});
