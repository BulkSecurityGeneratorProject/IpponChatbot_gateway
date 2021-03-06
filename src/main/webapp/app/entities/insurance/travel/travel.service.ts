import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import * as moment from 'moment';
import { DATE_FORMAT } from 'app/shared/constants/input.constants';
import { map } from 'rxjs/operators';

import { SERVER_API_URL } from 'app/app.constants';
import { createRequestOption } from 'app/shared';
import { ITravel } from 'app/shared/model/insurance/travel.model';

type EntityResponseType = HttpResponse<ITravel>;
type EntityArrayResponseType = HttpResponse<ITravel[]>;

@Injectable({ providedIn: 'root' })
export class TravelService {
    private resourceUrl = SERVER_API_URL + 'insurance/api/travels';

    constructor(private http: HttpClient) {}

    create(travel: ITravel): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(travel);
        return this.http
            .post<ITravel>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    update(travel: ITravel): Observable<EntityResponseType> {
        const copy = this.convertDateFromClient(travel);
        return this.http
            .put<ITravel>(this.resourceUrl, copy, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    find(id: number): Observable<EntityResponseType> {
        return this.http
            .get<ITravel>(`${this.resourceUrl}/${id}`, { observe: 'response' })
            .pipe(map((res: EntityResponseType) => this.convertDateFromServer(res)));
    }

    query(req?: any): Observable<EntityArrayResponseType> {
        const options = createRequestOption(req);
        return this.http
            .get<ITravel[]>(this.resourceUrl, { params: options, observe: 'response' })
            .pipe(map((res: EntityArrayResponseType) => this.convertDateArrayFromServer(res)));
    }

    delete(id: number): Observable<HttpResponse<any>> {
        return this.http.delete<any>(`${this.resourceUrl}/${id}`, { observe: 'response' });
    }

    private convertDateFromClient(travel: ITravel): ITravel {
        const copy: ITravel = Object.assign({}, travel, {
            departureDate: travel.departureDate != null && travel.departureDate.isValid() ? travel.departureDate.format(DATE_FORMAT) : null,
            returnDate: travel.returnDate != null && travel.returnDate.isValid() ? travel.returnDate.format(DATE_FORMAT) : null
        });
        return copy;
    }

    private convertDateFromServer(res: EntityResponseType): EntityResponseType {
        res.body.departureDate = res.body.departureDate != null ? moment(res.body.departureDate) : null;
        res.body.returnDate = res.body.returnDate != null ? moment(res.body.returnDate) : null;
        return res;
    }

    private convertDateArrayFromServer(res: EntityArrayResponseType): EntityArrayResponseType {
        res.body.forEach((travel: ITravel) => {
            travel.departureDate = travel.departureDate != null ? moment(travel.departureDate) : null;
            travel.returnDate = travel.returnDate != null ? moment(travel.returnDate) : null;
        });
        return res;
    }
}
