import { concatParamsToURL, getParameterByName, removeLoginSuffix } from 'app/utils/index';
import { ajaxRequestTypes } from 'app/actionTypes';
import api from 'app/const/api';
import { catchReqError } from 'app/actions/ajaxRequest';

const cachedReq: any = {};

export const normalizeSelectedPlayers = (selectedPlayers: any[], shouldRemoveLoginSuffix: boolean = false) =>
    selectedPlayers.map((item) => ({ id: item.id, name: shouldRemoveLoginSuffix ? removeLoginSuffix(item.login) : item.login, title: item.login }));

export const onSearchPlayers = (dispatch: any, that: any, shouldRemoveLoginSuffix?: boolean) =>  (val: string) => {
    if (val.trim().length < 1) {
        that.setState({ playersSelectOptions: normalizeSelectedPlayers(that.props.selectedPlayers, shouldRemoveLoginSuffix) });
        return;
    }

    that.setState({ searchPlayersValue: val });

    if (cachedReq[val]) {
      that.setState({ playersSelectOptions: cachedReq[val] })
      return;
    }

    let platform = getParameterByName('platform', that.props.location.search);
    let params: any = {
        sortKey: 'login',
        page: 1,
        limit: 10,
        roomsId: [-1],
        sortDirection: 'asc',
        searchKey: 'login',
        platform: platform,
        status: [0, 1],
        role: ['0'],
        searchValue: val
    };
    let token = localStorage.getItem('sessionId') as string;
    const request = {
        method: ajaxRequestTypes.METHODS.GET,
        headers: {
            'x-request-sign': token
        }
    };

    fetch(concatParamsToURL(api.GET_ALL_USERS, params), request)
        .then((res) => {
            if (!res.ok) {
                throw res.json()
            }
            return res.json()
        })
        .then((res) => {
          const newPlayersSelectOptions = res.data
            .filter(({ id }: any) => !that.props.selectedPlayers.find(({ id: selectedPlayerId }: any) => selectedPlayerId === id))
            .map(({ id, login }: { id: number; login: string }) => ({ id, name: login, title: login }));

          cachedReq[val] = newPlayersSelectOptions;

          that.setState(({
            playersSelectOptions: [
              ...that.props.selectedPlayers.map(({ id, login }: { id: number; login: string }) => ({ id, name: login, title: login })),
              ...newPlayersSelectOptions,
            ]
          }))
          }
        )
        .catch((err) => err.then((e: any) => catchReqError(e, dispatch, that.props.history)));
}
